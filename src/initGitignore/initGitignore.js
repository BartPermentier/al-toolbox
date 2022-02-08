const vscode = require('vscode');
const workspaceManagement = require('../fileManagement/workspaceManagement');
const genFunc = require('../generalFunctions');

const lines = [
    ".alpackages/",
    ".alcache/",
    ".altemplates/",
    ".altestrunner/",
    "launch.json",
    "!app.json",
    "rad.json",
    "*.app",    
    "*.g.xlf"
]

exports.initGitignore = function initGitignore(){
    const gitignorePath = workspaceManagement.getCurrentWorkspaceFolderPath() + '/.gitignore';
    vscode.workspace.openTextDocument(gitignorePath)
        .then(gitignoreDocument => {
            updateGitignore(gitignoreDocument);
        }, _ => {
            createGitignore(vscode.Uri.file(gitignorePath));
        });
}

/**
 * @param {vscode.Uri} uri 
 */
function createGitignore(uri) {
    const edit = new vscode.WorkspaceEdit();
    edit.createFile(uri);
    edit.insert(uri, new vscode.Position(0, 0), "# ALTB\n" + lines.join("\n") + "\n");
    vscode.workspace.applyEdit(edit);
}

/**
 * @param {vscode.TextDocument} textDocument 
 */
function updateGitignore(textDocument) {
    const text = textDocument.getText();
    let toAdd = '';
    lines.forEach(line => {
        const regex = new RegExp(`^${genFunc.escapeRegExp(line)}$`, 'm');
        if (!regex.exec(text))
            toAdd += line + "\n"; 
    });

    if (toAdd != ''){
        const lastLine = textDocument.lineAt(textDocument.lineCount - 1);
        const edit = new vscode.WorkspaceEdit();
        edit.insert(textDocument.uri, lastLine.range.end, '\n# ALTB\n' + toAdd);
        vscode.workspace.applyEdit(edit);
    }
}