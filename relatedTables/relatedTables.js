const vscode = require('vscode');
const constants = require('./constants');
const fileMangagement = require('./fileManagement');

/**
 * @returns {Promise}
 */
exports.createRelatedTables = (objectNamePrefix) => {
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