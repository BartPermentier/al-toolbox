const vscode = require('vscode');
const codeFixer = require('./codeFixer');
const pragmaBase = require('./pragmaBase');

class AddPragmaAllCodeFixer extends pragmaBase.PragmaBase {
    /**
     * @param {vscode.ExtensionContext} context 
     * @param {string} dignosticCode 
     */
    constructor(context, dignosticCode){
        super(context, dignosticCode, surroundWithPragmaAndTodo, 'ALTB: Surround {0} with Pragma', 'al-toolbox.surroundWithPragmaAllDoc');
    }
}
exports.AddPragmaAllCodeFixer = AddPragmaAllCodeFixer;

/**
 * @param {vscode.WorkspaceEdit} edit
 * @param {vscode.Uri} uri
 * @param {vscode.Diagnostic} diagnostic 
 */
 async function surroundWithPragmaAndTodo(edit, uri, diagnostic) {  
    const document = await vscode.workspace.openTextDocument(uri);
    const pragmaTexts = pragmaBase.PragmaBase.getPragmaTexts(diagnostic,false,'')

    edit.insert(uri, document.lineAt(diagnostic.range.start.line).range.start, pragmaTexts.disableText + '\n');
    edit.insert(uri, document.lineAt(diagnostic.range.end.line + 1).range.start, pragmaTexts.restoreText + '\n');  
}