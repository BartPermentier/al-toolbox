const vscode = require('vscode');
const relatedTables = require('./relatedTables/relatedTables');
const alFileManagement = require('./fileManagement/alFileManagement');
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
            relatedTables.createRelatedTables(objectPrefix, getFileNameFormatter())
                .then(() => vscode.window.showInformationMessage(`Related tables & pages created with prefix: '${objectPrefix}'`),
                    () => vscode.window.showInformationMessage('Failed to create related tables & pages'));
        }
    }));
    const RelatedTablesManager = new relatedTables.RelatedTablesManager();
    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.openRelatedTables', () => {
        const currendDoc = vscode.window.activeTextEditor.document;
        const extensionObjectInfo = relatedTables.getExtensionObjectInfo(currendDoc);
        if (extensionObjectInfo) {
            if (!RelatedTablesManager.openRelateTables(extensionObjectInfo.exendedObjectName, extensionObjectInfo.alObjectType))
                vscode.window.showInformationMessage('No related tables found');
        } else
            vscode.window.showInformationMessage('No page-/tableextension found in open file');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.openRelatedPages', () => {
        const currendDoc = vscode.window.activeTextEditor.document;
        const extensionObjectInfo = relatedTables.getExtensionObjectInfo(currendDoc);
        if (extensionObjectInfo) {
            if (!RelatedTablesManager.openRelatePages(extensionObjectInfo.exendedObjectName, extensionObjectInfo.alObjectType))
                vscode.window.showInformationMessage('No related pages found');
        } else
            vscode.window.showInformationMessage('No page-/tableextension found in open file');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.openRelatedTablesAndPages', () => {
        const currendDoc = vscode.window.activeTextEditor.document;
        const extensionObjectInfo = relatedTables.getExtensionObjectInfo(currendDoc);
        if (extensionObjectInfo) {
            if(!RelatedTablesManager.openRelatePagesAndTables(extensionObjectInfo.exendedObjectName, extensionObjectInfo.alObjectType))
                vscode.window.showInformationMessage('No related tables or pages found');
        } else
            vscode.window.showInformationMessage('No page-/tableextension found in open file');
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

/**
 * @returns {Promise<string>}
 */
async function getObjectPrefix() {
    let objectPrefix;
    let settings = vscode.workspace.getConfiguration('CRS');
    objectPrefix = settings.get('ObjectNamePrefix');
    if (!objectPrefix) {
        settings = vscode.workspace.getConfiguration('alVarHelper');
        objectPrefix = settings.get('ignoreALPrefix');
        if (!objectPrefix)
            objectPrefix = await vscode.window.showInputBox({placeHolder: 'Object prefix'}).then(newPrefix => newPrefix);
    }
    return objectPrefix
}
/**
 * @returns {(objectType: string, objectId: number, objectName: string) => string}
 */
function getFileNameFormatter() {
    const settings = vscode.workspace.getConfiguration('ALTB');
    const UseOldFileNamingConventions = settings.get('UseOldFileNamingConventions');
    if (UseOldFileNamingConventions)
        return alFileManagement.oldAlFileNameFormatter;
    else
        return alFileManagement.newAlFileNameFormatter;
}