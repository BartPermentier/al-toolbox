const vscode = require('vscode');
const { DiagnosticManager } = require('../diagnosticManager');

const commentRegex = /(?<=\bComment\s*=\s*)'(?<comment>([^']|'')*)'/gi;

/**
 * @param {vscode.TextDocument} file 
 */
function getFautyTranslations(file) {
    const text = file.getText();
    let match;
    const faultyTranslationRanges = [];
    while (match = commentRegex.exec(text)) {
        if (!checkTranslationFormat(match.groups.comment) && !isInComment(file.positionAt(match.index), file)) {
            faultyTranslationRanges.push(
                new vscode.Range(file.positionAt(match.index), file.positionAt(match.index + match[0].length))
            );
        }
    }
    return faultyTranslationRanges;
}

/**
 * @param {vscode.Position} position 
 * @param {vscode.TextDocument} file 
 */
function isInComment(position, file) {
    const text = file.getText(new vscode.Range(new vscode.Position(position.line, 0), position));
    return text.includes('//');
}


const translationFormatRegex = /^(\w{3}|[a-z]{2}-[A-Z]{2})="[^"=]*"(,(\w{3}|[a-z]{2}-[A-Z]{2})="[^"=]*")*$/;
/**
 * @param {string} text 
 */
function checkTranslationFormat(text) {
    if (translationFormatRegex.exec(text))
        return true;
    return false;
}


/**
 * @param {vscode.Uri} uri
 */
function createTranslationDiagnostics(uri) {
    return vscode.workspace.openTextDocument(uri)
        .then(textDoc => getFautyTranslations(textDoc))
        .then(ranges => ranges.map(range => {
            const diagnostic = new vscode.Diagnostic(range, 'Translation format is incorrect. Must match regex /\\w{3}="[^"=]*"(,\\w{3}="[^"=]*")*/.', vscode.DiagnosticSeverity.Warning)
            diagnostic.source = 'AL Toolbox';
            return diagnostic;
        }));
}

exports.CommentTranslationDiagnosticMangager = class CommentTranslationDiagnosticMangager extends DiagnosticManager {
    constructor() {
        super(createTranslationDiagnostics, '**/*.al', 'CheckCommentTranslations');
    }
}