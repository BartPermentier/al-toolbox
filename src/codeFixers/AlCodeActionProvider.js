const vscode = require('vscode');
const codeFixers = require('./codeFixers');

exports.AlCodeActionProvider = class AlCodeActionProvider {
    relevantDiagnostics;
    diagnosticCodeToFix;

    /**
     * @param {vscode.ExtensionContext} context 
     */
    constructor(context) {
        this.context = context;
        this.diagnosticCodeToFix = {
            'AA0008': new codeFixers.MissingBracketsCodeFixer(context, 'AA0008'),
        }
        this.relevantDiagnostics = Object.keys(this.diagnosticCodeToFix);
    }

    /**
     * @param {vscode.TextDocument} document 
     * @param {vscode.Range | vscode.Selection} range 
     * @param {vscode.CodeActionContext} context 
     * @param {vscode.CancellationToken} token 
     * @returns {vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]>}
     */
    provideCodeActions(document, range, context, token) {
        if (context.diagnostics.length === 0) return;
        const diagnostics = this.filterOutIrrelevantDiagnostics(context.diagnostics);
        let actions = [];
        for(let i = 0; i < diagnostics.length; i++) {
            if (token.isCancellationRequested) return;
            actions = actions.concat(this.createCodeActions(document, diagnostics[i]));
        }

        return actions;
    }

    /**
     * @param {readonly vscode.Diagnostic[]} diagnostics 
     */
    filterOutIrrelevantDiagnostics(diagnostics) {
        return diagnostics.filter(diagnostic => this.relevantDiagnostics.includes(diagnostic.code));
    }

    /**
     * @param {vscode.TextDocument} document 
     * @param {vscode.Diagnostic} diagnostic
     */
    createCodeActions(document, diagnostic) {
        const fix = this.diagnosticCodeToFix[diagnostic.code.toString()];
        return [
            makeCodeAction(fix.title, fix.commandName, codeFixers.fixTypes.Once),
            makeCodeAction(`${fix.title} (everywhere in this document)`, fix.commandName, codeFixers.fixTypes.CurrentDocument),
            makeCodeAction(`${fix.title} (in all documents)`, fix.commandName, codeFixers.fixTypes.AllDocuments)
        ];
    }
}

function makeCodeAction(title, commandName, fixType) {
    const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    action.command = {
        command: commandName,
        arguments: [fixType],
        title: title
    }
    return action;
}