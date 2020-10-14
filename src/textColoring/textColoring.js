const vscode = require('vscode');

const regionRegex = /^(\s*(\/\/\s*)?#(end)?region)\b.*$/mg;

let regionDecoration;
let regionTextDecoration;
exports.setRegionColor = function () {
    const document = vscode.window.activeTextEditor.document;
    if (document.languageId !== 'al') return;
    if (regionDecoration) regionDecoration.dispose();
    if (regionTextDecoration) regionTextDecoration.dispose();

    const altbConfig = vscode.workspace.getConfiguration('ALTB');
    const regionColor = altbConfig.get('RegionColor');
    const regionTextColor = altbConfig.get('RegionTextColor');
    if (regionColor === "" && regionTextColor === "") return;

    regionDecoration = vscode.window.createTextEditorDecorationType({
        color: regionColor
    });
    
    regionTextDecoration = vscode.window.createTextEditorDecorationType({
        color: regionTextColor
    });
    
    const text = document.getText();
    const regionTokenRanges = [];
    const regionTextRanges = [];
    let match;
    while((match = regionRegex.exec(text))){
        if (regionColor !== "")
            regionTokenRanges.push(new vscode.Range(
                document.positionAt(match.index),
                document.positionAt(match.index + match[1].length)
            ))
        if (regionTextColor !== "")
            regionTextRanges.push(new vscode.Range(
                document.positionAt(match.index + match[1].length),
                document.positionAt(match.index + match[0].length)
            ))
    }

    if (regionTokenRanges.length > 0)
        vscode.window.activeTextEditor.setDecorations(regionDecoration, regionTokenRanges);
        
    if (regionTextRanges.length > 0)
        vscode.window.activeTextEditor.setDecorations(regionTextDecoration, regionTextRanges);
}