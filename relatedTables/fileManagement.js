const path = require("path");
const fs = require("fs");
const glob = require('glob');
const vscode = require('vscode');
const constants = require("./constants");

//#region AL File Creation
function createAlFile(destinationPath, objectType, objectId, objectName, objectNamePrefix){
    const newObjectId = objectId + 80000;
    let newObjectName = objectName.replace(/[^\w]/g,'');
    let fileName;
    let fileContent;
    // Generate File Name and Content
    switch (objectType) {
        case constants.AlObjectTypes.tableExtension:
            fileName = constants.AlObjectTypesToFilePrefix(constants.AlObjectTypes.tableExtension);
            fileContent = 
        `
{
    fields
    {

    }
}`;
            break;
        case constants.AlObjectTypes.pageExtension:
            fileName = constants.AlObjectTypesToFilePrefix(constants.AlObjectTypes.pageExtension);
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
    
    fileName = fileName + objectId + '-' + 'Ext' + newObjectId + '.' + newObjectName + '.al';
    //vscode.window.showInformationMessage(fileName);
    //Generate Path
    const filePath = path.join(destinationPath, fileName);
    return existsFileAsync(filePath)
            .then(exists => {
            if (exists) {
                return filePath;
            }
            const contents = objectType + ' ' + newObjectId + ' "' + objectNamePrefix + newObjectName + '" extends "' +  objectName + '" //' + objectId + fileContent;
            return writeTextFileAsync(filePath, contents)
                .then(() => filePath);
            });  
}
exports.createAlFile = createAlFile;
//#endregion

//#region File Creation
function writeTextFileAsync(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, { encoding: "utf-8" }, e => {
            if (e) {
                return reject(e);
            }
            resolve(true);
        });
    });
}
function existsFileAsync(filename) {
    return new Promise(resolve => {
        fs.exists(filename, exists => {
            resolve(exists);
        });
    });
}
//#endregion

//#region Workspace Finder
function getCurrentWorkspaceFolderPath() {
    const currentWorkspaceFolder = getCurrentWorkspaceFolder();
    if (currentWorkspaceFolder) {
        return currentWorkspaceFolder.uri.fsPath;
    }
    return undefined;
}
exports.getCurrentWorkspaceFolderPath = getCurrentWorkspaceFolderPath;

function getCurrentWorkspaceFolder() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        if (activeEditor.document) {
            lastActiveWorkspace = getWorkspaceFolderFromPath(activeEditor.document.fileName);
            return lastActiveWorkspace;
        }
    }
}

function getWorkspaceFolderFromPath(path) {
    if (!Array.isArray(vscode.workspace.workspaceFolders) || vscode.workspace.workspaceFolders.length === 0) {
        lastActiveWorkspace = undefined;
        return lastActiveWorkspace;
    }
    // one workspace folder, this is the old folder/rootpath scenario.
    if (vscode.workspace.workspaceFolders.length === 1) {
        lastActiveWorkspace = vscode.workspace.workspaceFolders[0];
        return lastActiveWorkspace;
    }
    const uri = vscode.Uri.file(path);
    const workspace = vscode.workspace.getWorkspaceFolder(uri);
    return workspace;
}
//#endregion

//#region Folder Creation
function createFolder(dir) {
    if (fs.existsSync(dir)) return;
    if (!fs.existsSync(path.dirname(dir))) {
        this.makeDirSync(path.dirname(dir));
    }
    fs.mkdirSync(dir);
}
exports.createFolder = createFolder;
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
    const filePrefix = constants.AlObjectTypesToFilePrefix(alObjectType);
    const fileLocationFormat = `${getCurrentWorkspaceFolderPath()}/src/**/${filePrefix}*${compactObjectName}.al`;
    return glob.sync(fileLocationFormat);
}
exports.getAlFileLocations = getAlFileLocations;
//#endregion

let lastActiveWorkspace = undefined;