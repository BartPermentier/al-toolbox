const vscode = require('vscode');
const relatedTables = require('./relatedTables/relatedTables');
const alFileManagement = require('./fileManagement/alFileManagement');
const regionWrapper = require('./regionWrapper/regionWrapper');
const renumber = require('./renumberObjects/renumber');
const changePrefix = require('./changePrefix/changePrefix');
const uniqueApiEntities = require('./codeAnalyzers/apiPageEntityAnalyzer');

let fileSystemWatchers = new Map();

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
  
    //#region Related Tables
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
    //#endregion
    //#region Wrapping
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
    //#endregion

    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.renumberAll', () => {
        renumber.renumberAll().then(result => {
                let numberOfDocumentsChanged = 0;
                result.forEach(list => 
                    list.forEach(changed => {
                        if (changed) ++numberOfDocumentsChanged;
                    })
                );
                SaveAndCloseAll();
                vscode.window.showInformationMessage(`${numberOfDocumentsChanged} objects(s) renumbered.`);
            }, error => 
                vscode.window.showErrorMessage('An error occured: ' + error)
        );
    }));

    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.changePrefix', async () => {
        const currPrefix = await getObjectPrefix('current prefix');
        if (currPrefix !== undefined){
            const newPrefix = await vscode.window.showInputBox({placeHolder: 'new prefix'});
            if (newPrefix !== undefined) {
                if (currPrefix === newPrefix) {
                    vscode.window.showInformationMessage(`Prefix ${newPrefix} is the same as the current prefix.`);
                } else {
                    const changeInSetting = await vscode.window.showQuickPick(['Yes', 'No'], {placeHolder: 'Do you want to change the prefix in settings.json?'});
                    if (changeInSetting !== undefined) {
                        if (changeInSetting === 'Yes')
                            changePrefix.changePrefixSettings(currPrefix, newPrefix);
                        changePrefix.changeObjectPrefix(currPrefix, newPrefix)
                            .then(async results => {
                                await SaveAndCloseAll();
                                let numberOfDocumentsChanged = 0;
                                results.objectResults.forEach(result => {
                                    if (result) ++numberOfDocumentsChanged;
                                });
                                let numberOfFieldsChanged = 0;
                                results.fieldResults.forEach(result => {
                                    if (result) ++numberOfFieldsChanged;
                                });
                                vscode.window.showInformationMessage(
                                    `${numberOfFieldsChanged} field${numberOfFieldsChanged !== 1?'s':''} and ${numberOfDocumentsChanged} object${numberOfDocumentsChanged !== 1?'s':''} changed.`);
                            });
                    }
                }
            }
        }
    }))

    //#region Unique EntityNames & EntitySetName on API Pages
    const disbleAPIEntityWarnings = vscode.workspace.getConfiguration('ALTB').get('DisbleAPIEntityWarnings');
    if (!disbleAPIEntityWarnings){
        const apiPageEntityAnalyzer = new uniqueApiEntities.ApiPageEntityAnalyzer();
        
        vscode.workspace.workspaceFolders.forEach(workspaceFolder => {
            fileSystemWatchers.set(
                workspaceFolder.uri.fsPath,
                uniqueApiEntities.createFileSystemWatcher(workspaceFolder, apiPageEntityAnalyzer)
                );
            });
        vscode.workspace.onDidChangeWorkspaceFolders(e => {
            e.added.forEach(workspaceFolder => {
                apiPageEntityAnalyzer.init();
                fileSystemWatchers.set(
                    workspaceFolder.uri.fsPath,
                    uniqueApiEntities.createFileSystemWatcher(workspaceFolder, apiPageEntityAnalyzer)
                );
            });
                
            e.removed.forEach(workspaceFolder => {
                let watcher;
                if (watcher = fileSystemWatchers.get(workspaceFolder.uri.fsPath)) {
                    watcher.dispose();
                    fileSystemWatchers.delete(workspaceFolder.uri.fsPath);
                }
                apiPageEntityAnalyzer.removeFilesInFolder(workspaceFolder.uri);
            });
        })
    }
    //#endregion
}

// this method is called when your extension is deactivated
function deactivate() {
    fileSystemWatchers.forEach(fileWatcher => fileWatcher.dispose());
}

module.exports = {
	activate,
	deactivate
}

/**
 * @returns {Promise<string>}
 */
async function getObjectPrefix(placeHolder = 'Object prefix') {
    let settings = vscode.workspace.getConfiguration('CRS');
    let objectPrefix = settings.get('ObjectNamePrefix');
    if (!objectPrefix) {
        settings = vscode.workspace.getConfiguration('alVarHelper');
        objectPrefix = settings.get('ignoreALPrefix');
        if (!objectPrefix)
            objectPrefix = await vscode.window.showInputBox({placeHolder: placeHolder});
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

function SaveAndCloseAll() {
    return vscode.workspace.saveAll().then(() =>
        vscode.commands.executeCommand('workbench.action.closeAllEditors')
    );
}