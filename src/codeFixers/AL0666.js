const vscode = require('vscode');
const codeFixer = require('./codeFixer');


class RegionFixer extends codeFixer.CodeFixer {
    /**
     * @param {vscode.ExtensionContext} context 
     * @param {string} dignosticCode 
     */
    constructor(context, dignosticCode){
        super(context, dignosticCode, addSlashes, "ALTB: Add '//'", 'al-toolbox.addSlashes');
    }
}
exports.RegionFixer = RegionFixer;

/**
 * @param {vscode.WorkspaceEdit} edit
 * @param {vscode.Uri} uri
 * @param {vscode.Diagnostic} diagnostic 
 */
async function addSlashes(edit, uri, diagnostic) {
    edit.insert(uri, diagnostic.range.start, '//');
}