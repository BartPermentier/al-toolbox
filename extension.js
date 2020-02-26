const vscode = require('vscode');
const relatedTables = require('./relatedTables/relatedTables');
const regionWrapper = require('./regionWrapper/regionWrapper');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
  
    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.createRelatedTables', async () => {
        const objectPrefix = await getObjectPrefix();
        if (objectPrefix !== undefined) {
            relatedTables.createRelatedTables(objectPrefix)
                .then(() => vscode.window.showInformationMessage(`Related tables & pages created with prefix: '${objectPrefix}'`),
                    () => vscode.window.showInformationMessage('Failed to create related tables & pages'));
        }
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.wrapAllFunctions', function () {
        let editor = vscode.window.activeTextEditor;
        let numberOfRegions; 
        editor.edit(editBuilder => {
            numberOfRegions = regionWrapper.WrapAllFunctions(editBuilder, editor.document);
        }).then(() => vscode.window.showInformationMessage(numberOfRegions +' region(s) created.'));
    }));
    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.wrapAllDataItemsAndColumns', function () {
        let editor = vscode.window.activeTextEditor;
        let numberOfRegions; 
        editor.edit(editBuilder => {
            numberOfRegions = regionWrapper.WrapAllDataItemsAndColumns(editBuilder, editor.document, false);
        }).then(() => vscode.window.showInformationMessage(numberOfRegions +' region(s) created.'));
    }));
    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.wrapAll', function () {
        let editor = vscode.window.activeTextEditor;
        let numberOfRegions;
        editor.edit(editBuilder => {
            numberOfRegions = regionWrapper.WrapAllFunctions(editBuilder, editor.document);
            numberOfRegions += regionWrapper.WrapAllDataItemsAndColumns(editBuilder, editor.document, false);
        }).then(() => vscode.window.showInformationMessage(numberOfRegions +' region(s) created.'));
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

async function getObjectPrefix() {
    let objectPrefix;
    let settings = vscode.workspace.getConfiguration('CRS');
    objectPrefix = settings.get('ObjectNamePrefix');
    if (!objectPrefix) {
        settings = vscode.workspace.getConfiguration('alVarHelper');
        objectPrefix = settings.get('ignoreALPrefix');
        if (!objectPrefix)
            objectPrefix = await vscode.window.showInputBox({ placeHolder: 'Object prefix'}).then(newPrefix => newPrefix);
    }
    return objectPrefix
}