const vscode = require('vscode');
const codeFixer = require('./codeFixer');
const genFunc = require('../generalFunctions');

exports.PragmaBase = class PragmaBase extends codeFixer.CodeFixer {
    /**
     * @param {vscode.ExtensionContext} context
     * @param {function(vscode.WorkspaceEdit, vscode.Uri, vscode.Diagnostic): void} func 
     * @param {string} title 
     */
    constructor(context, dignosticCode, func, title, commandName) {
        super(context, dignosticCode, func, title, commandName);
    }   

    /**
     * @param {vscode.WorkspaceEdit} edit
     * @param {vscode.Uri} uri
     * @param {vscode.Diagnostic} diagnostic 
     * @param {boolean} addTodo 
     */
    static async insertPragma(edit, uri, diagnostic,addTodo) {
        let comment = ''
        
        if(addTodo) {
            comment = await vscode.window.showInputBox({
                placeHolder: 'Enter a TODO comment',
                prompt: 'TODO Comment',
            })            
        }
        
        const editor = vscode.window.activeTextEditor;
        const document = await vscode.workspace.openTextDocument(uri);

        const pragmaTexts = this.getPragmaTexts(diagnostic,addTodo,comment);
       
        return editor.edit(editBuilder=>{
            this.addPragmaText(editBuilder, document.lineAt(diagnostic.range.start.line),pragmaTexts.disableText);
            this.addPragmaText(editBuilder, document.lineAt(diagnostic.range.end.line+1),pragmaTexts.restoreText);
        });  
    }

    /**
     * @param {boolean} addTodo 
     * @param {string} comment 
     */
    static addTodo(addTodo,comment) { 
        if (!addTodo)
            return "";
        
        let todo = ' // TODO:';
        if (comment.length != 0) {
            todo += ' - ' + comment;
        } 

        return todo;
    }

    static addPragmaText(editBuilder, line, param) {
        const range = line.range;
        editBuilder.insert(range.start, param + '\n');
    }  
    
    /**
     * @param {vscode.Diagnostic} diagnostic 
     * @param {boolean} addTodo 
     * @param {string} comment 
     */
    static getPragmaTexts(diagnostic, addTodo, comment) {
        const disableText = '#pragma warning disable ' + genFunc.getDiagnosticCode(diagnostic) + this.addTodo(addTodo, comment);
        const restoreText = '#pragma warning restore ' + genFunc.getDiagnosticCode(diagnostic) + this.addTodo(addTodo, comment);

        return {
            disableText: disableText,
            restoreText: restoreText
        }
    }
}