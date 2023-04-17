const vscode = require('vscode');

const regionRegex = /^(\s*(\/\/\s*)?#(end)?region)\b.*$/mg;
const regionTokenRegex = /#(end)?region/;
const telemetry = require('../telemetry');
exports.RegionColorManager = class RegionColorManager {

    /**
     * @param {vscode.ExtensionContext} context
     */
    constructor(context) {
        context.subscriptions.push(
            vscode.window.onDidChangeVisibleTextEditors(
                this.setRegionColorForEditors, this),

            vscode.workspace.onDidChangeTextDocument(
                this.setRegionColorForChangedDocument, this),

            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("ALTB.RegionColor") ||
                    e.affectsConfiguration("ALTB.RegionTextColor")) {
                        this.updateDecorations();
                }
            }, this),
        );
        this.updateDecorations();
    }

    dispose() {
        if (this.regionDecoration) this.regionDecoration.dispose();
        if (this.regionTextDecoration) this.regionTextDecoration.dispose();
    }

    updateDecorations() {
        this.dispose();
        const altbConfig = vscode.workspace.getConfiguration('ALTB');
        const regionColor = altbConfig.get('RegionColor');
        const regionTextColor = altbConfig.get('RegionTextColor');
        if (regionColor === "")
            this.regionDecoration = undefined;
        else {
            telemetry.sendUseRegionColorEvent();
            this.regionDecoration = vscode.window.createTextEditorDecorationType({
                color: regionColor
            });
        }

        if (regionTextColor === "")
            this.regionTextDecoration = undefined;
        else {
            telemetry.sendUseRegionTextColorEvent();
            this.regionTextDecoration = vscode.window.createTextEditorDecorationType({
                color: regionTextColor
            });
        }
        
        this.setRegionColorForEditors(vscode.window.visibleTextEditors);
    }
   
    /**
     * @param {vscode.TextEditor} textEditor
     */
    setRegionColor(textEditor) {
        const document = textEditor.document;
        if (document.languageId !== 'al') return;

        const text = document.getText();
        const regionTokenRanges = [];
        const regionTextRanges = [];
        let match;
        if (this.regionDecoration || this.regionTextDecoration) {
            while((match = regionRegex.exec(text))){
                if (this.regionDecoration)
                    regionTokenRanges.push(new vscode.Range(
                        document.positionAt(match.index),
                        document.positionAt(match.index + match[1].length)
                    ));
                if (this.regionTextDecoration)
                    regionTextRanges.push(new vscode.Range(
                        document.positionAt(match.index + match[1].length),
                        document.positionAt(match.index + match[0].length)
                    ));
            }
        }
    
        if (regionTokenRanges.length > 0)
            textEditor.setDecorations(this.regionDecoration, regionTokenRanges);
            
        if (regionTextRanges.length > 0)
            textEditor.setDecorations(this.regionTextDecoration, regionTextRanges);
    }

    /**
     * @param {Array<vscode.TextEditor>} textEditors 
     */
    setRegionColorForEditors(textEditors){
        textEditors.forEach(textEditor => {
            this.setRegionColor(textEditor);
        });
    }

    /**
     * @param {vscode.TextDocumentChangeEvent} textDocumentChangeEvent 
     */
    setRegionColorForChangedDocument(textDocumentChangeEvent) {
        const visibleTextEditors = vscode.window.visibleTextEditors;
        const document = textDocumentChangeEvent.document;
        let textEditor;
        if ((textEditor = visibleTextEditors.find(visibleTextEditor => visibleTextEditor.document === document))) {
            let changeIncludesRegion = false
            for(let i = 0; !changeIncludesRegion && i < textDocumentChangeEvent.contentChanges.length; ++i) {
                const contentChange = textDocumentChangeEvent.contentChanges[i];
                changeIncludesRegion = 
                    (contentChange.text.length === 0 && contentChange.rangeLength > 0) // If text is deleted -> recolor
                    || regionRegex.test(contentChange.text); // If new text includes a region -> recolor
                if (!changeIncludesRegion) {
                    const text = document.getText(new vscode.Range(
                        new vscode.Position(contentChange.range.start.line, 0),
                        new vscode.Position(contentChange.range.end.line + 2, 0)
                    ));
                    
                    changeIncludesRegion = regionTokenRegex.test(text); // If lines that were changed include a region -> recolor           
                }
            }
            
            if (changeIncludesRegion)
                this.setRegionColor(textEditor);
        }
    }
}