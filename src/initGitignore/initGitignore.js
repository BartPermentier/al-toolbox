const vscode = require('vscode');
const workspaceManagement = require('../fileManagement/workspaceManagement');

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
    edit.insert(uri, new vscode.Position(0, 0),
`# ALTB
.alpackages/
.alcache/
rad.json
*.app
`);
    vscode.workspace.applyEdit(edit);
}

/**
 * @param {vscode.TextDocument} textDocument 
 */
function updateGitignore(textDocument) {
    const text = textDocument.getText();
    let toAdd = '';
    if (!/^\.alpackages\/$/m.exec(text))
        toAdd += '.alpackages/\n';
    if (!/^\.alcache\/$/m.exec(text))
        toAdd += '.alcache/\n';
    if (!/^rad\.json$/m.exec(text))
        toAdd += 'rad.json\n';
    if (!/^\*\.app$/m.exec(text))
        toAdd += '*.app\n';

    if (toAdd != ''){
        const lastLine = textDocument.lineAt(textDocument.lineCount - 1);
        const edit = new vscode.WorkspaceEdit();
        edit.insert(textDocument.uri, lastLine.range.end, '\n# ALTB\n' + toAdd);
        vscode.workspace.applyEdit(edit);
    }
}