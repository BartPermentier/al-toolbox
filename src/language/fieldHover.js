const vscode = require('vscode');

const descriptionRegex = /^\s*;\s*\w+(\s*\[\s*\d+\s*\])?\s*\)\s*\{(\s*\w+\s*=[^;]*;)*\s*description\s*=\s*'(?<description>([^']|'')*)';/i;

exports.FieldHoverProvider = class FieldHoverProvider {
    
    /**
     * returns the Description of a field
     * 
     * @param {vscode.TextDocument} document 
     * @param {vscode.Position} position 
     * @param {vscode.CancellationToken} token 
     * 
     * @returns {vscode.ProviderResult<vscode.Hover>}
     */
    provideHover(document, position, token) {
        return vscode.commands.executeCommand('vscode.executeDefinitionProvider', document.uri, position)
            .then(definitions => {
                if (token.isCancellationRequested) return Promise.reject('Canceled');
                if (definitions.length !== 1) return Promise.reject('No or multiple definitions found');
                return definitions[0];
            }).then(definition => {
                return vscode.workspace.openTextDocument(definition.uri).then(textDocument => {
                    if (token.isCancellationRequested) return Promise.reject('Canceled');

                    const text = textDocument.getText(new vscode.Range(
                        definition.range.end, textDocument.lineAt(textDocument.lineCount-1).range.end
                    ));
                    const match = descriptionRegex.exec(text);
                    if (!match) return Promise.reject('No definition found');
                    const description = match.groups.description;
                    return new vscode.Hover(description);
                });
            });
    }
}