const constants = require("../constants");
const fileManagement = require('./fileManagement');
const workspaceManagement = require('./workspaceManagement');
const path = require("path");
const vscode = require("vscode");
const glob = require("glob");

//#region AL File Creation
/**
 * 
 * @param {string} destinationPath 
 * @param {string} objectType 
 * @param {number} objectId 
 * @param {string} objectName 
 * @param {string} objectNamePrefix 
 * @param {(objectType: string, objectId: number, objectName: string) => string} fileNameFormatter 
 */
function createAlFile(destinationPath, objectType, objectId, objectName, objectNamePrefix, fileNameFormatter){
    const newObjectId = objectId + 80000;
    let newObjectName = objectName.replace(/[^\w]/g,'');
    let fileContent;
    // Generate File Name and Content
    switch (objectType) {
        case constants.AlObjectTypes.tableExtension:
            fileContent = 
        `
{
    fields
    {

    }
}`;
            break;
        case constants.AlObjectTypes.pageExtension:
            fileContent = 
        `
{
    layout
    {
    }

    actions
    {
    }
}`;
            break;
        default:
            console.error('Unsuported AL object type.');
            throw Error('Unsuported AL object type.');
    }
    
    const fileName = fileNameFormatter(objectType, objectId, objectName);
    //vscode.window.showInformationMessage(fileName);
    //Generate Path
    const filePath = path.join(destinationPath, fileName);
    return fileManagement.existsFileAsync(filePath)
            .then(exists => {
            if (exists) {
                return filePath;
            }
            const contents = objectType + ' ' + newObjectId + ' "' + objectNamePrefix + newObjectName + '" extends "' +  objectName + '" //' + objectId + fileContent;
            return fileManagement.writeTextFileAsync(filePath, contents)
                .then(() => filePath);
            });  
}
exports.createAlFile = createAlFile;

/**
 * 
 * @param {string} objectType 
 * @param {number} objectId 
 * @param {string} objectName
 * @returns {string}
 */
function oldAlFileNameFormatter(objectType, objectId, objectName){
    const newObjectId = 80000 + objectId;
    const prefix = constants.AlObjectTypesToFilePrefix(objectType);
    const newObjectName = objectName.replace(/[^\w]/g,'');
    return prefix + objectId + '-' + 'Ext' + newObjectId + '.' + newObjectName + '.al';
}
exports.oldAlFileNameFormatter = oldAlFileNameFormatter;

/**
 * 
 * @param {string} objectType 
 * @param {number} objectId 
 * @param {string} objectName
 * @returns {string}
 */
function newAlFileNameFormatter(objectType, objectId, objectName){
    const newObjectName = objectName.replace(/[^\w]/g,'');
    const fullTypeName = constants.AlObjectTypesToFullTypeName(objectType);
    return newObjectName + '.' + fullTypeName + '.al';
}
exports.newAlFileNameFormatter = newAlFileNameFormatter;
//#endregion

//#region Open AL files
/**
 * @param {string} objectName
 * @param {string} alObjectType
 * @returns {Thenable<vscode.TextDocument>[]} 
 */
function openALFile(objectName, alObjectType) {
    const tenables = [];
    const files = getAlFileLocations(objectName, alObjectType);
    files.forEach(file => tenables.push(
        vscode.workspace.openTextDocument(file).then(doc => {
            vscode.window.showTextDocument(doc, {preserveFocus: true, preview: false});
        })
    ));
    return tenables;
}
exports.openALFile = openALFile;

/**
 * @param {string} objectName
 * @param {string} alObjectType
 * @returns {string[]} File locations 
 */
function getAlFileLocations(objectName, alObjectType){
    const compactObjectName = objectName.replace(/[^\w]/g, '');

    const UseOldFileNamingConventions = vscode.workspace.getConfiguration('ALTB').get('UseOldFileNamingConventions');
    
    let fileLocationFormat = `${workspaceManagement.getCurrentWorkspaceFolderPath()}/src/**/`;
    if(UseOldFileNamingConventions) {
        const filePrefix = constants.AlObjectTypesToFilePrefix(alObjectType);
        fileLocationFormat += `${filePrefix}*${compactObjectName}.al`;
    } else {
        const fullTypeName = constants.AlObjectTypesToFullTypeName(alObjectType);
        fileLocationFormat += `${compactObjectName}.${fullTypeName}.al`;
    }

    return glob.sync(fileLocationFormat);
}
exports.getAlFileLocations = getAlFileLocations;
//#endregion

exports.getFileFormatForType = function getFileFormatForType(alObjectType) {
    const UseOldFileNamingConventions = vscode.workspace.getConfiguration('ALTB').get('UseOldFileNamingConventions');

    let fileLocationFormat;
    if(UseOldFileNamingConventions) {
        const filePrefix = constants.AlObjectTypesToFilePrefix(alObjectType);
        fileLocationFormat = `${filePrefix}*.al`;
    } else {
        const fullTypeName = constants.AlObjectTypesToFullTypeName(alObjectType);
        fileLocationFormat = `*.${fullTypeName}.al`;
    }
    // Upercase letter may be lowercase
    fileLocationFormat = fileLocationFormat.replace(/[A-Z]/, match => `{${match},${match.toLowerCase()}}`);

    return fileLocationFormat;
};

const alObjectRegex = /(?<type>\w+)(\s+(?<id>\d+))?\s+(?<name>\w+|"[^"]*")(\s+extends\s+(?<extendedName>\w+|"[^"]*")(\s*\/\/\s*(?<extendedId>\d+))?|\s+implements\s+(?<interfaces>(\w+|"[^"]*")(\s*,\s*(\w+|"[^"]*"))*))?/i;
class AlObjectInfo {
    type;
    id;
    name;
    extendedName;
    extendedId;
    interfaces;

    path;

    /**
     * @param {vscode.TextDocument} textDocument  
     */
    constructor(textDocument) {
        this.path = textDocument.uri;
        const match = alObjectRegex.exec(textDocument.getText());
        this.type = match.groups.type.toLowerCase();
        if(Object.values(constants.AlObjectTypes).includes(this.type)){
            this.name = match.groups.name;
            
            if(this.type !== constants.AlObjectTypes.interface && this.type !== constants.AlObjectTypes.controleAddIn)
                this.id = Number(match.groups.id);

            if(constants.isExtensionType(this.type)) {
                this.extendedName = match.groups.extendedName;
                this.extendedId = match.groups.extendedId;
                if(this.extendedId) {
                    this.extendedId = Number(this.extendedId);
                }
            }

            if(this.type === constants.AlObjectTypes.codeUnit && match.groups.interfaces) {
                this.interfaces = match.groups.interfaces.split(",").map(interfaceName => {
                    return interfaceName.trim();
                });
            }
        } else {
            this.type = undefined;
        }
    }

    isExtensionObject() {
        return this.extendedName !== undefined;
    }
}
exports.AlObjectInfo = AlObjectInfo;