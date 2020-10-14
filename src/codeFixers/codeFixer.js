const vscode = require('vscode');
const faults = require('../fault');

const fixTypes = {
    Once: 0,
    CurrentDocument: 1,
    AllDocuments: 2
}
exports.fixTypes = fixTypes;

exports.CodeFixer = class CodeFixer {
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
        extensionContext.subscriptions.push(vscode.commands.registerCommand(this.commandName, (type, diagnostic, document) => {
            switch (type) {
                case fixTypes.Once:
                    this.fix(document.uri, diagnostic);
                    break;
                case fixTypes.AllDocuments:
                    this.fixAll();
                    break;
                case fixTypes.CurrentDocument:            
                default:
                    this.fixAllInDocument(document.uri);
                    break;
            }
        }))
    }

    /**
     * @param {vscode.Uri} uri
     * @param {vscode.Diagnostic} diagnostic 
     */
    async fix(uri, diagnostic) {
        const edit = new vscode.WorkspaceEdit();
        await this.func(edit, uri, diagnostic);
        vscode.workspace.applyEdit(edit);
    }

    /**
     * @param {vscode.Uri} uri
     */
    async fixAllInDocument(uri) {
        const edit = new vscode.WorkspaceEdit();
        const diagnostics = vscode.languages.getDiagnostics(uri);
        const document = await vscode.workspace.openTextDocument(uri);
        await Promise.all(diagnostics.filter(diagnostic => this.isRelevant(document, diagnostic)).map(diagnostic => {
            return this.func(edit, uri, diagnostic);
        }));
        return vscode.workspace.applyEdit(edit);
    }

    async fixAll() {
        const edit = new vscode.WorkspaceEdit();
        const uriDiagnosticPairs = vscode.languages.getDiagnostics();
        const uris = [];
        await Promise.all(uriDiagnosticPairs.map(async uriDiagnosticPair => {
            const uri = uriDiagnosticPair[0];
            const document = await vscode.workspace.openTextDocument(uri);
            const diagnostics = uriDiagnosticPair[1];
            await Promise.all(diagnostics.filter(diagnostic => this.isRelevant(document, diagnostic)).map(diagnostic => {
                return this.func(edit, uri, diagnostic);
            }));
            uris.push(uri);
        }));
        return vscode.workspace.applyEdit(edit).then(async success => {
            if (success) {
                await Promise.all(
                    uris.map(uri => vscode.workspace.openTextDocument(uri)
                        .then(textDoc => textDoc.save())));
            }
            return success;
        });
    }

    /**
     * This function is meant to be overwritten by class extensions
     * @param {vscode.TextDocument} document 
     * @param {vscode.Range | vscode.Selection} range 
     * @param {vscode.Diagnostic} diagnostic
     */
    checkIfRelevant(document, range, diagnostic) {
        return true;
    }

    /**
     * @param {vscode.TextDocument} document
     * @param {vscode.Diagnostic} diagnostic
     */
    isRelevant(document, diagnostic) {
        return diagnostic.code === this.dignosticCode
            && this.checkIfRelevant(document, diagnostic.range, diagnostic);
    }
}