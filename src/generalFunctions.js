const vscode = require('vscode');
const fileManagement = require('./fileManagement/fileManagement');


/**
 * @param {string} string 
 */
exports.escapeRegExp = function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

exports.useAlRegions = async function () {
    if (vscode.workspace.getConfiguration('ALTB').get('UseAlRegions')) {
        const appFileUri = await fileManagement.getAppFile();
        const file = await vscode.workspace.openTextDocument(appFileUri);
        if (file) {
            const json = JSON.parse(file.getText());
            if (json && json.runtime) {
                const runtime = parseInt(json.runtime.split('.')[0]);
                if (runtime >= 6)
                    return true;
            }
        }
    }
    return false;
}

exports.snippetTargetLanguage = async function () {
    let uri = vscode.window.activeTextEditor.document.uri;
    return await vscode.workspace.getConfiguration('ALTB', uri).get('snippetTargetLanguage');
}

exports.snippetTargetLanguage2 = async function () {
    let uri = vscode.window.activeTextEditor.document.uri;
    return vscode.workspace.getConfiguration('ALTB', uri).get('snippetTargetLanguage2');
}

exports.removeDuplicates = function (arr) {
    var arrayWithoutDuplicates = [];

    arr.forEach(element => {
        if (arrayWithoutDuplicates.find(key => key.toUpperCase() === element.toUpperCase()) == undefined) {
            arrayWithoutDuplicates.push(element);
        }
    });

    return arrayWithoutDuplicates;
}

exports.getDiagnosticCode = function (diagnostic) {
    return (diagnostic.code.value !== undefined ? diagnostic.code.value : diagnostic.code);
}