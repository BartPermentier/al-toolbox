const vscode = require('vscode');
const codeFixer = require('./codeFixer');

class MissingBracketsCodeFixer extends codeFixer.CodeFixer {
    /**
     * @param {vscode.ExtensionContext} context 
     * @param {string} dignosticCode 
     */
    constructor(context, dignosticCode){
        super(context, dignosticCode, AddBrackets, 'ALTB: Add round brackets', 'al-toolbox.addBrackets');
    }
}
exports.MissingBracketsCodeFixer = MissingBracketsCodeFixer;

/**
 * @param {vscode.WorkspaceEdit} edit
 * @param {vscode.Uri} uri
 * @param {vscode.Diagnostic} diagnostic 
 */
function AddBrackets(edit, uri, diagnostic) {
    edit.insert(uri, diagnostic.range.end, '()');
}