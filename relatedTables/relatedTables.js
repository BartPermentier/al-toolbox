const vscode = require('vscode');
const constants = require('./constants');
const fileMangagement = require('./fileManagement');

/**
 * @returns {Promise}
 */
exports.createRelatedTables = function createRelatedTables(objectNamePrefix) {
    const rootPath = fileMangagement.getCurrentWorkspaceFolderPath();
    // if rootpath is empty then error
    if (!rootPath) {
        return Promise.reject("No AL workspace folder is active");
    }

    const baseDestinationPath = rootPath + '/src/';
    fileMangagement.createFolder(baseDestinationPath);

    let destinationPath;
    const fileCreationPromises = [];
    constants.RelatedTables.forEach(element => {
        destinationPath = baseDestinationPath + element.objectType;
        fileMangagement.createFolder(destinationPath);
        destinationPath += '/' + element.folder
        fileMangagement.createFolder(destinationPath);

        element.objects.forEach(object => {
            fileCreationPromises.push(fileMangagement.createAlFile(destinationPath, element.objectType, object.id, object.name, objectNamePrefix));
        });
    });

    return Promise.all(fileCreationPromises);
}


exports.RelatedTablesManager = class RelatedTablesManager {
    tableToRelatedObjects;
    pageToRelatedTable;

    constructor() {
        this.setTableAndPageToRelatedObjects();
    }

    setTableAndPageToRelatedObjects() {
        this.tableToRelatedObjects = new Map();
        this.pageToRelatedTable = new Map();
        constants.RelatedTables.forEach(element => {
            element.objects.forEach(object => {
                if (!this.tableToRelatedObjects.has(element.table))
                this.tableToRelatedObjects.set(element.table, new Map());
                if (!this.tableToRelatedObjects.get(element.table).has(element.objectType))
                this.tableToRelatedObjects.get(element.table).set(element.objectType, []);

                this.tableToRelatedObjects.get(element.table).get(element.objectType).push(object.name);

                if (element.objectType === constants.AlObjectTypes.pageExtension) {
                    this.pageToRelatedTable.set(object.name, element.table);
                }
            });
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
            fileMangagement.openALFile(relatedObject.name, relatedObject.type)
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
                if (this.tableToRelatedObjects.has(objectName) && this.tableToRelatedObjects.get(objectName).has(alObjectType)) {
                    this.tableToRelatedObjects.get(objectName).get(alObjectType).forEach(
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