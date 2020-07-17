const vscode = require('vscode');

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
    if (activeEditor && activeEditor.document) {    
        lastActiveWorkspace = getWorkspaceFolderFromPath(activeEditor.document.fileName);
        return lastActiveWorkspace;
    } else if (vscode.workspace.workspaceFolders.length == 1) {
        return vscode.workspace.workspaceFolders[0];
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

let lastActiveWorkspace = undefined;