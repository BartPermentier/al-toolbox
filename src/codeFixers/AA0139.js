const vscode = require('vscode');
const codeFixer = require('./codeFixer');
const faults = require('../fault');


class PossibleOverflowCodeFixer extends codeFixer.CodeFixer {
    /**
     * @param {vscode.ExtensionContext} context 
     * @param {string} dignosticCode 
     */
    constructor(context, dignosticCode){
        super(context, dignosticCode, surroundWithCopyStr, 'Surround with CopyStr', 'al-toolbox.surroundWithCopyStr');
    }
}
exports.PossibleOverflowCodeFixer = PossibleOverflowCodeFixer;

/**
 * @param {vscode.WorkspaceEdit} edit
 * @param {vscode.Uri} uri
 * @param {vscode.Diagnostic} diagnostic 
 */
async function surroundWithCopyStr(edit, uri, diagnostic) {
    const prefix = 'CopyStr(';
    let suffix = ', 1, ';
    
    const textDoc = await vscode.workspace.openTextDocument(uri);
    let lineNoMin2 = diagnostic.range.start.line - 2; // It is possible that we need to look further back for finding the variable, but that would be some strange formatting ;)
    if (lineNoMin2 < 0) lineNoMin2 = 0;
    const textLast3Lines = textDoc.getText(
        new vscode.Range(new vscode.Position(lineNoMin2, 0), diagnostic.range.start)
    );

    let matches = textLast3Lines.match(/((("[^"]*"|\w+)\.)?("[^"]*"|\w+))(\s|\n)*:=(\s|\n)*$/);
    if (matches) {
        suffix += `MaxStrLen(${matches[1]}))`;
    } else {
        matches = diagnostic.message.match(/\bto '(Text|Code)\[(\d+)\]'/);
        if (matches) {
            suffix += `${matches[2]})`;
            const faultRange = extendRange(diagnostic.range, prefix.length + suffix.length);
            const fault = new faults.Fault(
                `Unable to find string variable to use for length (line ${faultRange.start.line}, column ${faultRange.start.character} in ${getFileName(uri)})`,
                uri, faultRange);
            fault.showInformationMessage();
        } else {
            suffix += `/* TODO: length */)`;
            const faultRange = extendRange(diagnostic.range, prefix.length + suffix.length);
            const fault = new faults.Fault(
                `Unable to find length (line ${faultRange.start.line}, column ${faultRange.start.character} in ${getFileName(uri)})`,
                uri, faultRange);
            fault.showErrorMessage();
        }
    }
    edit.insert(uri, diagnostic.range.start, prefix);
    edit.insert(uri, diagnostic.range.end, suffix);
}

/**
 * @param {vscode.Range} range 
 * @param {number} length 
 */
function extendRange(range, length) {
    return new vscode.Range(
        range.start,
        range.end.translate(0, length));
}

/**
 * @param {vscode.Uri} uri 
 */
function getFileName(uri) {
    const parts = uri.fsPath.split(/[\/\\]/);
    return parts[parts.length-1];
}