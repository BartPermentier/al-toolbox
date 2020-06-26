const vscode = require('vscode');

class Fault {
    message;
    uri;
    range;

    /**
     * @param {string} message
     * @param {vscode.Uri} uri
     * @param {vscode.Range} range
     */
    constructor(message, uri, range) {
        this.message = message;
        this.uri = uri;
        this.range = range;
    }

    async goto() {
        const textDoc = await vscode.workspace.openTextDocument(this.uri);
        const textEditor = await vscode.window.showTextDocument(textDoc);
        if(this.range) {
            textEditor.revealRange(this.range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
            textEditor.selection = new vscode.Selection(this.range.start, this.range.end)
        }
    }

    showErrorMessage(){
        vscode.window.showErrorMessage(this.message, 'Go to').then(option => {
            if (option === 'Go to'){
                this.goto();
            }
        });
    }

    showInformationMessage(){
        vscode.window.showInformationMessage(this.message, 'Go to').then(option => {
            if (option === 'Go to'){
                this.goto();
            }
        });
    }
}
exports.Fault = Fault;