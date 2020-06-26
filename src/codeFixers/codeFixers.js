const vscode = require('vscode');
const faults = require('../fault');

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
        await Promise.all(diagnostics.filter(diagnostic => diagnostic.code === this.dignosticCode).map(diagnostic => {
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
            const diagnostics = uriDiagnosticPair[1];
            await Promise.all(diagnostics.filter(diagnostic => diagnostic.code === this.dignosticCode).map(diagnostic => {
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


class PossibleOverflowCodeFixer extends CodeFixer {
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
    let lineNoMin2 = diagnostic.range.start.line - 2; // It is posible that we need to look further back for finding the variable, but that would be some strange formatting ;)
    if (lineNoMin2 < 0) lineNoMin2 = 0;
    const textLast3Lines = textDoc.getText(
        new vscode.Range(new vscode.Position(lineNoMin2, 0), diagnostic.range.start)
    )

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
    edit.insert(uri, diagnostic.range.end, suffix)
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