const vscode = require('vscode');
const codeFixer = require('./codeFixer');
const pragmaBase = require('./pragmaBase');
const telemetry = require('../telemetry');

class AddPragmaCodeFixer extends pragmaBase.PragmaBase {
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
    telemetry.sendPragmaEvent();
    pragmaBase.PragmaBase.insertPragma(edit,uri,diagnostic,false) 
}