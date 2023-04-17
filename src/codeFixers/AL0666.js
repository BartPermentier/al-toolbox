const vscode = require('vscode');
const codeFixer = require('./codeFixer');
const telemetry = require('../telemetry');

class RegionFixer extends codeFixer.CodeFixer {
    /**
     * @param {vscode.ExtensionContext} context 
     * @param {string} dignosticCode 
     */
    constructor(context, dignosticCode){
        super(context, dignosticCode, addSlashes, "ALTB: Add '//'", 'al-toolbox.addSlashes');
        this.checkIfRelevant = this.dignosticContainsRegion;
    }

    /**
     * @param {vscode.TextDocument} document 
     * @param {vscode.Range | vscode.Selection} range 
     * @param {vscode.Diagnostic} diagnostic
     */
    dignosticContainsRegion(document, range, diagnostic) {
        const wordRange = document.getWordRangeAtPosition(range.end, /#(end)?region/);
        return wordRange? true : false;
    }
}
exports.RegionFixer = RegionFixer;

async function addSlashes(edit, uri, diagnostic) {
    telemetry.sendFixAA0666Event();
    edit.insert(uri, diagnostic.range.start, '//');
}