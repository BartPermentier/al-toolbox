const vscode = require('vscode');
const codeFixer = require('./codeFixer');
const pragmaBase = require('./pragmaBase');

class AddPragmaWithTodoCodeFixer extends pragmaBase.PragmaBase {
    /**
     * @param {vscode.ExtensionContext} context 
     * @param {string} dignosticCode 
     */
    constructor(context, dignosticCode){
        super(context, dignosticCode, surroundWithPragmaAndTodo, 'ALTB: Surround {0} with Pragma & add TODO tag (with comment)', 'al-toolbox.surroundWithPragmaAndTodo');
    }
}
exports.AddPragmaWithTodoCodeFixer = AddPragmaWithTodoCodeFixer;

/**
 * @param {vscode.WorkspaceEdit} edit
 * @param {vscode.Uri} uri
 * @param {vscode.Diagnostic} diagnostic 
 */
 async function surroundWithPragmaAndTodo(edit, uri, diagnostic) {
    pragmaBase.PragmaBase.insertPragma(edit,uri,diagnostic,true) 
}