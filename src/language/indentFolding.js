const vscode = require('vscode');

class IndentFoldingRangeProvider {
    /**
     * 
     * @param {vscode.TextDocument} document 
     * @param {vscode.FoldingContext} _ 
     * @param {vscode.CancellationToken} token 
     * @returns {vscode.ProviderResult<vscode.FoldingRange[]>}
     */
    provideFoldingRanges(document, _, token) {
        const foldingRanges = [];
        const startRanges = [];
        let currentIndent = 0, lastNonWhitespaceLineNo = 0;

        for(let lineNo = 0; lineNo < document.lineCount; ++lineNo) {
            const line = document.lineAt(lineNo);
            if (!line.isEmptyOrWhitespace) {
                const indent = line.firstNonWhitespaceCharacterIndex;
                
                if (indent > currentIndent) {
                    startRanges.push({lineNo: lastNonWhitespaceLineNo, indent: currentIndent});
                } else if (indent < currentIndent) {
                    do
                        foldingRanges.push(new vscode.FoldingRange(startRanges.pop().lineNo, lineNo - 1));
                    while(startRanges.length > 0 && startRanges[startRanges.length-1].indent >= indent)
                }
                currentIndent = indent;
                lastNonWhitespaceLineNo = lineNo
            }
            if(lineNo % 50 === 0 && token.isCancellationRequested) {
                return [];
            }
        }

        return foldingRanges;
    }

}
exports.IndentFoldingRangeProvider = IndentFoldingRangeProvider;