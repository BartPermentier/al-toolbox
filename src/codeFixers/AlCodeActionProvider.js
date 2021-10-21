const vscode = require('vscode');
const codeFixer = require('./codeFixer');
const AA0008 = require('./AA0008');
const AA0139 = require('./AA0139');
const AL0666 = require('./AL0666');
const PRAGMA = require('./pragma');
const PRAGMAWITHTODO = require('./pragmaWithTodo');
const PRAGMAALL = require('./pragmaAll');
const constants = require('../constants');

exports.AlCodeActionProvider = class AlCodeActionProvider {
    relevantDiagnostics;
    diagnosticCodeToFix;

    /**
     * @param {vscode.ExtensionContext} context 
     */
    constructor(context) {
        this.context = context;
        this.diagnosticCodeToFix = {
            'AA0008': new AA0008.MissingBracketsCodeFixer(context, 'AA0008'),
            'AA0139': new AA0139.PossibleOverflowCodeFixer(context, 'AA0139'),
            'AL0666': new AL0666.RegionFixer(context, 'AL0666'),
            'PRAGMA': new PRAGMA.AddPragmaCodeFixer(context, 'PRAGMA'),
            'PRAGMAALL': new PRAGMAALL.AddPragmaAllCodeFixer(context, constants.PragmaAll),
            'PRAGMAWITHTODO': new PRAGMAWITHTODO.AddPragmaWithTodoCodeFixer(context, 'PRAGMAWITHTODO')
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
            actions = actions.concat(this.createCodeActions(document, range, diagnostics[i]));
        }
        // Add Pragma action for all warnings
        let warnings = context.diagnostics.filter(diagnostic=>[diagnostic.severity==vscode.DiagnosticSeverity.Warning,diagnostic.severity==vscode.DiagnosticSeverity.Information]);
        warnings = warnings.filter(warning=> !["AA0021","AL0604","AA0139"].includes(warning.code.toString()));
        const fix = this.diagnosticCodeToFix["PRAGMA"];
        const fixAll = this.diagnosticCodeToFix["PRAGMAALL"];
        const fixWithTodo = this.diagnosticCodeToFix["PRAGMAWITHTODO"];
        for(let i = 0; i < warnings.length; i++) {
            if (token.isCancellationRequested) return;
            actions = actions.concat([makeCodeAction(fix.title.replace("{0}",warnings[i].code), fix.commandName, codeFixer.fixTypes.Once, warnings[i], document)]);            
            actions = actions.concat([makeCodeAction(fixWithTodo.title.replace("{0}",warnings[i].code), fixWithTodo.commandName, codeFixer.fixTypes.Once, warnings[i], document)]);
            actions = actions.concat([makeCodeAction(fixAll.title.replace("{0}",warnings[i].code) + " (in all documents)", fixAll.commandName, codeFixer.fixTypes.AllDocuments, warnings[i], document)]);            
        }
        return actions;
    }

    /**
     * @param {readonly vscode.Diagnostic[]} diagnostics 
     */
    filterOutIrrelevantDiagnostics(diagnostics) {
        return diagnostics.filter(diagnostic => this.relevantDiagnostics.includes(diagnostic.code.toString()));
    }

    /**
     * @param {vscode.TextDocument} document 
     * @param {vscode.Range | vscode.Selection} range 
     * @param {vscode.Diagnostic} diagnostic
     */
    createCodeActions(document, range, diagnostic) {
        const fix = this.diagnosticCodeToFix[diagnostic.code.toString()];
        if (fix.checkIfRelevant(document, range, diagnostic))
            return [
                makeCodeAction(fix.title, fix.commandName, codeFixer.fixTypes.Once, diagnostic, document),
                makeCodeAction(`${fix.title} (everywhere in this document)`, fix.commandName, codeFixer.fixTypes.CurrentDocument, diagnostic, document),
                makeCodeAction(`${fix.title} (in all documents)`, fix.commandName, codeFixer.fixTypes.AllDocuments, diagnostic, document)
            ];
        else return [];
    }
}

function makeCodeAction(title, commandName, fixType, diagnostic, document) {
    const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    action.command = {
        command: commandName,
        arguments: [fixType, diagnostic, document],
        title: title
    }
    return action;
}