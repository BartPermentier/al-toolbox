const vscode = require('vscode');

const fixTypes = {
    Once: 0,
    CurrentDocument: 1,
    AllDocuments: 2
}
exports.fixTypes = fixTypes;

class CodeFixer {
    dignosticCode;
    func;
    title;
    commandName;

    /**
     * @param {vscode.ExtensionContext} extensionContext
     * @param {function(vscode.WorkspaceEdit, vscode.Uri, vscode.Diagnostic): void} func 
     * @param {string} title 
     */
    constructor(extensionContext, dignosticCode, func, title, commandName) {
        this.dignosticCode = dignosticCode;
        this.func = func;
        this.title = title;
        this.commandName = commandName
        extensionContext.subscriptions.push(vscode.commands.registerCommand(this.commandName, (type) => {
            switch (type) {
                case fixTypes.Once:
                    const textEditor = vscode.window.activeTextEditor;
                    vscode.languages.getDiagnostics(textEditor.document.uri).filter(
                        diagnostic =>
                            diagnostic.code === this.dignosticCode &&
                            diagnostic.range.intersection(textEditor.selection)
                    ).forEach(diagnostic => {
                        this.fix(textEditor.document.uri, diagnostic);
                    });
                    break;
                case fixTypes.AllDocuments:
                    this.fixAll();
                    break;
                case fixTypes.CurrentDocument:            
                default:
                    this.fixAllInDocument(vscode.window.activeTextEditor.document.uri);
                    break;
            }
        }))
    }

    /**
     * @param {vscode.Uri} uri
     * @param {vscode.Diagnostic} diagnostic 
     */
    fix(uri, diagnostic) {
        const edit = new vscode.WorkspaceEdit();
        this.func(edit, uri, diagnostic);
        vscode.workspace.applyEdit(edit);
    }

    /**
     * @param {vscode.Uri} uri
     */
    fixAllInDocument(uri) {
        const edit = new vscode.WorkspaceEdit();
        const diagnostics = vscode.languages.getDiagnostics(uri);
        diagnostics.filter(diagnostic => diagnostic.code === this.dignosticCode).forEach(diagnostic => {
            this.func(edit, uri, diagnostic);
        });
        return vscode.workspace.applyEdit(edit);
    }

    fixAll() {
        const edit = new vscode.WorkspaceEdit();
        const uriDiagnosticPairs = vscode.languages.getDiagnostics();
        const uris = [];
        uriDiagnosticPairs.forEach(uriDiagnosticPair => {
            const uri = uriDiagnosticPair[0];
            const diagnostics = uriDiagnosticPair[1];
            diagnostics.filter(diagnostic => diagnostic.code === this.dignosticCode).forEach(diagnostic => {
                this.func(edit, uri, diagnostic);
            });
            uris.push(uri);
        });
        return vscode.workspace.applyEdit(edit).then(async success => {
            if (success) {
                await Promise.all(
                    uris.map(uri => vscode.workspace.openTextDocument(uri)
                        .then(textDoc => textDoc.save())));
            }
            return success;
        });
    }
}

class MissingBracketsCodeFixer extends CodeFixer {
    /**
     * @param {vscode.ExtensionContext} context 
     * @param {string} dignosticCode 
     */
    constructor(context, dignosticCode){
        super(context, dignosticCode, AddBrackets, 'Add brackets', 'al-toolbox.addBrackets');
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