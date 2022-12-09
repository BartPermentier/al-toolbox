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
        const json = await fileManagement.getAppFileContents();
        if (json && json.runtime) {
            const runtime = parseInt(json.runtime.split('.')[0]);
            if (runtime >= 6)
                return true;
        }
    }
    return false;
}

exports.usePromotedActionProperties = async function () {
    const json = await fileManagement.getAppFileContents();
    if (json && json.runtime && json.features) {
        const noPromotedActionProperties = parseInt(json.features.indexOf("NoPromotedActionProperties")) !== -1;
        const runtime = parseInt(json.runtime.split('.')[0]);
        return !(noPromotedActionProperties && runtime >= 10);
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