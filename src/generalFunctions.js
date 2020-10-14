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
                const runtime = parseInt(json.runtime.charAt(0));
                if (runtime >= 6)
                    return true;
            }
        }
    }
    return false;
}