const vscode = require('vscode');

class RegionFoldingRangeProvider {
    /**
     * 
     * @param {vscode.TextDocument} document 
     * @param {vscode.FoldingContext} _ 
     * @param {vscode.CancellationToken} token 
     * @returns {vscode.ProviderResult<vscode.FoldingRange[]>}
     */
    provideFoldingRanges(document, _, token) {
        return getRegions(document.getText(), /^\s*\/\/\s*#region\b/, /^\s*\/\/\s*#endregion\b/, token).map(value => {
            return new vscode.FoldingRange(value.start, value.end, vscode.FoldingRangeKind.Region);
        });
    }

}
exports.RegionFoldingRangeProvider = RegionFoldingRangeProvider;

/**
 * Make sure that regionStart and regionEnd won't match the same line.
 * 
 * @param {string} text
 * @param {RegExp} regionStart 
 * @param {RegExp} regionEnd 
 * @param {vscode.CancellationToken} token
 * @returns {{start: number, end: number}[]}
 */
function getRegions(text, regionStart, regionEnd, token){
    if (regionStart.global) throw 'regionStart should not have option "global"';
    if (regionEnd.global) throw 'regionEnd should not have option "global"';

    const regions = [];
    const openRegion = []
    const lines = text.split('\n');
    lines.forEach((line, index) => {
        if (regionStart.exec(line)) {
            openRegion.push(index);
        } else if (regionEnd.exec(line)) {
            const start = openRegion.pop();
            if (start !== undefined) {
                regions.push({
                    start: start,
                    end: index
                });
            }
        }
        if(index % 50 === 0 && token.isCancellationRequested) {
            return [];
        }
    });
    
    return regions;
}