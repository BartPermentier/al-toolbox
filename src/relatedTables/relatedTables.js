const vscode = require('vscode');
const constants = require('../constants');
const fileManagement = require('../fileManagement/fileManagement');
const alFileMangagement = require('../fileManagement/alFileManagement');
const workspaceManagement = require('../fileManagement/workspaceManagement');
const generalFunctions = require('../generalFunctions');
const path = require('path');

/**
 * @param {string} objectNamePrefix
 * @param {(objectType: string, objectId: number, objectName: string) => string} fileNameFormatter
 * @returns {Promise}
 */
exports.createRelatedTables = function createRelatedTables(objectNamePrefix, fileNameFormatter) {
    const rootUri = workspaceManagement.getCurrentWorkspaceFolderUri();
    // if rootpath is empty then error
    if (!rootUri) {
        return Promise.reject("No AL workspace folder is active");
    }
    const PutCreatedRelatedObjectsInSeparateFolders = vscode.workspace.getConfiguration('ALTB', rootUri).get('PutCreatedRelatedObjectsInSeparateFolders');

    const baseDestinationPath = path.join(rootUri.fsPath, generalFunctions.sourceCodeFolderName());
    fileManagement.createFolder(baseDestinationPath);

    let destinationPath;
    const fileCreationPromises = [];
    getRelatedObjectData().forEach(element => {
        destinationPath = path.join(baseDestinationPath,element.objectType);
        fileManagement.createFolder(destinationPath);
        if (PutCreatedRelatedObjectsInSeparateFolders) {
            destinationPath = path.join(destinationPath, element.folder);
            fileManagement.createFolder(destinationPath);
        }

        element.objects.forEach(object => {
            fileCreationPromises.push(alFileMangagement.createAlFile(destinationPath, element.objectType, object.id, object.name, objectNamePrefix, fileNameFormatter));
        });
    });

    return Promise.all(fileCreationPromises);
}


exports.RelatedTablesManager = class RelatedTablesManager {
    tableToRelatedObjects;
    pageToRelatedTable;

    constructor() {
        this.setTableAndPageToRelatedObjects(getRelatedObjectData());
    }

    setTableAndPageToRelatedObjects(relatedObjects) {
        this.tableToRelatedObjects = new Map();
        this.pageToRelatedTable = new Map();
        relatedObjects.forEach(element => {
            if (element.objectType === constants.AlObjectTypes.tableExtension) {
                element.objects.forEach(object1 => {
                    if (!this.tableToRelatedObjects.has(object1.name)) {
                        this.tableToRelatedObjects.set(object1.name, {
                            [constants.AlObjectTypes.tableExtension]: new Set(),
                            [constants.AlObjectTypes.pageExtension]: new Set()
                        });
                    }
                    element.objects.forEach(object2 => {
                        if (object1.name !== object2.name) {
                            this.tableToRelatedObjects.get(object1.name)
                                [constants.AlObjectTypes.tableExtension].add(object2.name);
                        }
                    });
                });
            } else if (element.objectType === constants.AlObjectTypes.pageExtension) {
                element.objects.forEach(object => {
                    if (!this.tableToRelatedObjects.has(element.table)) {
                        this.tableToRelatedObjects.set(element.table, {
                            [constants.AlObjectTypes.tableExtension]: new Set(),
                            [constants.AlObjectTypes.pageExtension]: new Set()
                        });
                    }
                    this.tableToRelatedObjects.get(element.table)
                        [constants.AlObjectTypes.pageExtension].add(object.name);
                    this.pageToRelatedTable.set(object.name, element.table);
                });
            }
        });
    }

    //#region Open related objects
    /**
     * @param {string} objectName
     * @returns {boolean} Found related tables
     */
    openRelateTables(objectName, sourceAlObjectType) {
        return this.openRelateObjects(objectName, sourceAlObjectType, [constants.AlObjectTypes.tableExtension]);
    }
    
    /**
     * @param {string} objectName
     * @returns {boolean} Found related pages
     */
    openRelatePages(objectName, sourceAlObjectType) {
        return this.openRelateObjects(objectName, sourceAlObjectType, [constants.AlObjectTypes.pageExtension]);
    }
    
    /**
     * @param {string} objectName
     * @returns {boolean} Found related tables and/or pages
     */
    openRelatePagesAndTables(objectName, sourceAlObjectType) {
        return this.openRelateObjects(objectName, sourceAlObjectType, [constants.AlObjectTypes.tableExtension, constants.AlObjectTypes.pageExtension]);
    }
    //#endregion

    /**
     * Opens all related objects of 'objectName' that are Sof a object type in the 'alObjectTypes' array
     * @param {string} objectName
     * @param {string[]} alObjectTypes
     * @returns {boolean} Found related objects
     */
    openRelateObjects(objectName, sourceAlObjectType, alObjectTypes) {
        const relatedObjects = this.getRelateObjects(objectName, sourceAlObjectType, alObjectTypes);
        relatedObjects.forEach(relatedObject =>
            alFileMangagement.openALFile(relatedObject.name, relatedObject.type)
        );
        return relatedObjects.length > 0;
    }

    /**
     * @param {string} objectName
     * @param {string[]} alObjectTypesToOpen
     * @returns {{name: string, type: string}[]} Related AL objects
     */
    getRelateObjects(objectName, sourceAlObjectType, alObjectTypesToOpen){
        const relatedObjects = [];
        if (sourceAlObjectType === constants.AlObjectTypes.tableExtension) {
            alObjectTypesToOpen.forEach(alObjectType => {
                if (this.tableToRelatedObjects.has(objectName)) {
                    this.tableToRelatedObjects.get(objectName)[alObjectType].forEach(
                        objectName => relatedObjects.push({name: objectName, type: alObjectType})
                    );
                }
            });
        } else if (sourceAlObjectType === constants.AlObjectTypes.pageExtension) { 
            const relatedTableName = this.pageToRelatedTable.get(objectName);
            if (alObjectTypesToOpen.includes(constants.AlObjectTypes.tableExtension)){
                relatedObjects.push({name: relatedTableName, type: constants.AlObjectTypes.tableExtension});
            }
            if (alObjectTypesToOpen.includes(constants.AlObjectTypes.pageExtension)) {
                this.getRelateObjects(relatedTableName, constants.AlObjectTypes.tableExtension, alObjectTypesToOpen).forEach(relatedObject => {
                    if (relatedObject.name !== objectName)
                        relatedObjects.push(relatedObject);
                });
            }
        }
        return relatedObjects;
    }
}

//#region getExtensionObjectInfo
const extensionObjectRegex = /^\s*(?<alObjectType>(page|table)extension)\s+(?<objectId>\d+)\s+(?<extensionName>\w+|"[^"]*")\s+extends\s+(?<exendedObjectName>\w+|"[^"]*")(\s*\/\/\s*(?<exendedObjectId>\d+))?/m;
/**
 * Only works for extension objects
 * @param {vscode.TextDocument} document
 * @returns {{[key: string]: string}} Has keys: alObjectType, objectId, extensionName, exendedObjectName, and possibly exendedObjectId
 */
exports.getExtensionObjectInfo = function getExtensionObjectInfo(document){
    const match = extensionObjectRegex.exec(document.getText());
    if (match === null) return undefined;
    match.groups.extensionName = match.groups.extensionName.replace(/"/g, '');
    match.groups.exendedObjectName = match.groups.exendedObjectName.replace(/"/g, '');
    return match.groups;
}
//#endregion

function getRelatedObjectData() {
    const additionalObjects = vscode.workspace.getConfiguration('ALTB').get('AdditionalRelatedObjects');
    return constants.RelatedObjects.concat(additionalObjects);
}