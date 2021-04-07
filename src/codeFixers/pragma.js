const vscode = require('vscode');
const codeFixer = require('./codeFixer');

class AddPragmaCodeFixer extends codeFixer.CodeFixer {
    /**
     * @param {vscode.ExtensionContext} context 
     * @param {string} dignosticCode 
     */
    constructor(context, dignosticCode){
        super(context, dignosticCode, surroundWithPragma, 'ALTB: Surround {0} with Pragma', 'al-toolbox.surroundWithPragma');
    }
}
exports.AddPragmaCodeFixer = AddPragmaCodeFixer;

/**
 * @param {vscode.WorkspaceEdit} edit
 * @param {vscode.Uri} uri
 * @param {vscode.Diagnostic} diagnostic 
 */
async function surroundWithPragma(edit, uri, diagnostic) {
    const disable = '#pragma warning disable ' + diagnostic.code;
    const restore = '#pragma warning restore ' + diagnostic.code;
    const editor = vscode.window.activeTextEditor;
    const document = await vscode.workspace.openTextDocument(uri);
   
    return editor.edit(editBuilder=>{
        addPragmaText(editBuilder, document.lineAt(diagnostic.range.start.line),disable);
        addPragmaText(editBuilder, document.lineAt(diagnostic.range.end.line+1),restore);
    });
}

function addPragmaText(editBuilder, line, param) {
    const range = line.range;
    editBuilder.insert(range.start, param + '\n');
}