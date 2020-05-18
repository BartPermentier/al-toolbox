const constants = require('../constants');
const fileManagement = require('../fileManagement/fileManagement');
const workspaceManagement = require('../fileManagement/workspaceManagement');
const vscode = require('vscode');

/**
 * Changes object (and field) prefix in all *.al files
 * @param {string} currPrefix
 * @param {string} newPrefix
 */
exports.changeObjectPrefix = async function changeObjectPrefix(currPrefix, newPrefix) {
    const objectTypeRegex = '(' + Object.entries(constants.AlObjectTypes)
        .map((value) => value[1]).join('|') + ')';
    
    const nameRegex = `("${currPrefix}[^"]+"|${currPrefix}\\w+)`;
    const objectPrefixRegex = new RegExp(
        `(?<=^\s*${objectTypeRegex}(\\s+\\d+)?\\s+)${nameRegex}`, 'g');
    const fieldPrefixRegex = new RegExp(
        `(?<=field\\((\\d+;\\s*)?)${nameRegex}`, 'g');
    const currPrefixRegex = new RegExp(currPrefix);
    
    const currWorkspace = workspaceManagement.getCurrentWorkspaceFolderPath()

    let files = await vscode.workspace.findFiles('**/*.al');
    files = files.filter(file => file.fsPath.startsWith(currWorkspace));

    const fileProgressIncrement = 100 / files.length;

    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Updating prefixes...",
        cancellable: false
    }, async progress => {
        let objectResults = [];
        let fieldResults = [];
        for (let i = 0; i < files.length; ++i) {
            const textDocument = await vscode.workspace.openTextDocument(files[i]);
            let results = await fileManagement.renameAll(textDocument, objectPrefixRegex, currPrefixRegex, newPrefix);
            objectResults = objectResults.concat(results);
            results = await fileManagement.renameAll(textDocument, fieldPrefixRegex, currPrefixRegex, newPrefix);
            fieldResults = fieldResults.concat(results);
            progress.report({increment: fileProgressIncrement});
        }
        return {
            objectResults: objectResults,
            fieldResults: fieldResults
        };
    });
}

/**
 * Changes prefix in '.vscode/settings.json'
 * @param {string} currPrefix
 * @param {string} newPrefix
 */
exports.changePrefixSettings = async function changePrefixSettings(currPrefix, newPrefix){
    return fileManagement.getSettingsFile()
        .then(async file => {
            const textDocument = await vscode.workspace.openTextDocument(file);
            return fileManagement.replaceAll(textDocument, new RegExp(`(?<=:\\s*")${currPrefix}(?=")`, 'g'), newPrefix);
        });
}