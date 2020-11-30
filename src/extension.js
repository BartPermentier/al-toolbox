const vscode = require('vscode');
const constands = require('./constants');
const relatedTables = require('./relatedTables/relatedTables');
const alFileManagement = require('./fileManagement/alFileManagement');
const regionWrapper = require('./regionWrapper/regionWrapper');
const renumber = require('./renumberObjects/renumber');
const changePrefix = require('./changePrefix/changePrefix');
const uniqueApiEntities = require('./codeAnalyzers/apiPageEntityAnalyzer');
const copyFieldsToRelatedTables = require('./relatedTables/copyFieldsToRelatedTables');
const AlCodeActionProvider = require('./codeFixers/AlCodeActionProvider');
const initGitignore = require('./initGitignore/initGitignore');
const regionFolding = require('./language/regionFolding');
const indentFolding = require('./language/indentFolding');
const fieldHover = require('./language/fieldHover');
const contextSnippets = require('./contextSnippets/contextSnippets');
const textColoring = require('./textColoring/textColoring');
const setLoadFields = require('./codeGeneration/setLoadFields/setLoadFields');
const checkTranslations = require('./codeAnalyzers/XLF/checkTranslations');

let fileSystemWatchers = new Map();
let regionColorManager;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const config = vscode.workspace.getConfiguration('ALTB');
    //#region Commands
    //#region Related Tables
    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.createRelatedTables', async () => {
        const objectPrefix = await getObjectPrefix();
        if (objectPrefix !== undefined) {
            relatedTables.createRelatedTables(objectPrefix, getFileNameFormatter())
                .then(() => vscode.window.showInformationMessage(`Related tables & pages created with prefix: '${objectPrefix}'`),
                    reason => vscode.window.showInformationMessage(`Failed to create related tables & pages: ${reason}`));
        }
    }));
    const RelatedTablesManager = new relatedTables.RelatedTablesManager();
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('al-toolbox.openRelatedTables', textEditor => {
        const extensionObjectInfo = relatedTables.getExtensionObjectInfo(textEditor.document);
        if (extensionObjectInfo) {
            if (!RelatedTablesManager.openRelateTables(extensionObjectInfo.exendedObjectName, extensionObjectInfo.alObjectType))
                vscode.window.showInformationMessage('No related tables found');
        } else
            vscode.window.showInformationMessage('No page-/tableextension found in open file');
    }));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('al-toolbox.openRelatedPages', textEditor => {
        const extensionObjectInfo = relatedTables.getExtensionObjectInfo(textEditor.document);
        if (extensionObjectInfo) {
            if (!RelatedTablesManager.openRelatePages(extensionObjectInfo.exendedObjectName, extensionObjectInfo.alObjectType))
                vscode.window.showInformationMessage('No related pages found');
        } else
            vscode.window.showInformationMessage('No page-/tableextension found in open file');
    }));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('al-toolbox.openRelatedTablesAndPages', textEditor => {
        const extensionObjectInfo = relatedTables.getExtensionObjectInfo(textEditor.document);
        if (extensionObjectInfo) {
            if(!RelatedTablesManager.openRelatePagesAndTables(extensionObjectInfo.exendedObjectName, extensionObjectInfo.alObjectType))
                vscode.window.showInformationMessage('No related tables or pages found');
        } else
            vscode.window.showInformationMessage('No page-/tableextension found in open file');
    }));

    context.subscriptions.push(vscode.commands.registerTextEditorCommand('al-toolbox.copyFieldsToRelatedTables', async textEditor => {
        const currendDoc = textEditor.document;
        const currentFileObjectInfo = new alFileManagement.AlObjectInfo(currendDoc);
        if (currentFileObjectInfo.type !== constands.AlObjectTypes.tableExtension) {
            vscode.window.showErrorMessage(`File ${currendDoc.uri} is not a tableExtension`);
        } else {
            const relatedObjects = RelatedTablesManager.getRelateObjects(currentFileObjectInfo.extendedName, currentFileObjectInfo.type, [constands.AlObjectTypes.tableExtension]);
            const relatedObjectsTextDocuments = await Promise.all(
                relatedObjects.map(nameTypePair => {
                    const files = alFileManagement.getAlFileLocations(nameTypePair.name, nameTypePair.type);
                    if(files.length > 0)
                        return vscode.workspace.openTextDocument(files[0]);
                    else
                        return undefined;
                }));
            
            const info = await copyFieldsToRelatedTables.copyFieldsToRelatedTables(
                currendDoc,
                relatedObjectsTextDocuments.filter(textDocument => textDocument !== undefined)
            );
            
            info.faults.forEach(fault => fault.showErrorMessage());
            
            vscode.window.showInformationMessage(
                `Added ${info.nrFieldsAdded} field${info.nrFieldsAdded !== 1 ? 's' : ''}${info.nrFilesChanged !== 1 ? ` over ${info.nrFilesChanged} files` : ''}`
            )
        }
    }));
    //#endregion
    
    //#region Wrapping
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('al-toolbox.wrapAllFunctions', async (editor) => {
        let numberOfRegions; 
        const regionFormat = await regionWrapper.getRegionFormat();
        
        editor.edit(editBuilder => {
            numberOfRegions = regionWrapper.WrapAllFunctions(editBuilder, editor.document, regionFormat);
        }).then(() => vscode.window.showInformationMessage(numberOfRegions +' region(s) created.'));
    }));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('al-toolbox.wrapAllDataItemsAndColumns', async function (editor) {
        let numberOfRegions; 
        const regionFormat = await regionWrapper.getRegionFormat();
        editor.edit(editBuilder => {
            numberOfRegions = regionWrapper.WrapAllDataItemsAndColumns(editBuilder, editor.document, false, regionFormat);
        }).then(() => vscode.window.showInformationMessage(numberOfRegions +' region(s) created.'));
    }));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('al-toolbox.wrapAll', async function (editor) {
        let numberOfRegions;
        const regionFormat = await regionWrapper.getRegionFormat();
        editor.edit(editBuilder => {
            numberOfRegions = regionWrapper.WrapAllFunctions(editBuilder, editor.document, regionFormat);
            numberOfRegions += regionWrapper.WrapAllDataItemsAndColumns(editBuilder, editor.document, false, regionFormat);
        }).then(() => vscode.window.showInformationMessage(numberOfRegions +' region(s) created.'));
    }));

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('al-toolbox.addRegion', (editor) => contextSnippets.addRegion(editor))
    );
    //#endregion

    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.renumberAll', () => {
        renumber.renumberAll().then(results => {
                let numberOfDocumentsChanged = 0;
                results.forEach(changed => {
                        if (changed) ++numberOfDocumentsChanged;
                });
                if (numberOfDocumentsChanged > 0) SaveAndCloseAll();
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
    }));

    context.subscriptions.push(vscode.commands.registerCommand('al-toolbox.initGitignore', () => {
        initGitignore.initGitignore();
    }));

    context.subscriptions.push(vscode.commands.registerTextEditorCommand('al-toolbox.generateSetLoadFields', textEditor => {
        setLoadFields.generateSetLoadFields(textEditor, textEditor.selection.start).then(result => {
            if (result)
                if (result.fieldsAddedCount > 0) vscode.window.showInformationMessage(
                    `${result.fieldsAddedCount} field${result.fieldsAddedCount !== 1 ? 's' : ''} added over ${result.setLoadFieldsAddedOrModifiedCount} SetLoadField${result.setLoadFieldsAddedOrModifiedCount !== 1 ? 's' : ''}`); 
                else
                    vscode.window.showInformationMessage('No fields added');
        });
    }));
    //#endregion

    //#region Diagnostics
    //#region Unique EntityNames & EntitySetName on API Pages
    const disableAPIEntityWarnings = config.get('DisableAPIEntityWarnings');
    if (!disableAPIEntityWarnings){
        const apiPageEntityAnalyzer = new uniqueApiEntities.ApiPageEntityAnalyzer();
        
        vscode.workspace.workspaceFolders.forEach(workspaceFolder => {
            fileSystemWatchers.set(
                workspaceFolder.uri.fsPath,
                uniqueApiEntities.createFileSystemWatcher(workspaceFolder, apiPageEntityAnalyzer)
                );
            });
        context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(e => {
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
        }));
    }
    //#endregion

    //#region Translation Diagnostics
    let translationDiagnosticMangager = new checkTranslations.CommentTranslationDiagnosticMangager();
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(`ALTB.${translationDiagnosticMangager.enabledSetting}`)) {
            translationDiagnosticMangager.dispose();
            translationDiagnosticMangager.activate();
        }
    }));
    context.subscriptions.push(translationDiagnosticMangager);
    //#endregion
    //#endregion
    
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
            'al',
            new AlCodeActionProvider.AlCodeActionProvider(context),
            { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    ));
    if(!config.get('DisableHoverProviders'))
        context.subscriptions.push(vscode.languages.registerHoverProvider(
            'al', new fieldHover.FieldHoverProvider()
        ));

    const disableCustomFolding = config.get('DisableCustomFolding');
    if (!disableCustomFolding) {
        context.subscriptions.push(vscode.languages.registerFoldingRangeProvider('al', new regionFolding.RegionFoldingRangeProvider()));
        context.subscriptions.push(vscode.languages.registerFoldingRangeProvider('al', new indentFolding.IndentFoldingRangeProvider()));
    }

    const disableSnippets = config.get('DisableSnippets');
    if (!disableSnippets) context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider('al', new contextSnippets.SnippetCompletionItemProvider())
    );
    
    regionColorManager = new textColoring.RegionColorManager(context);
}

// this method is called when your extension is deactivated
function deactivate() {
    fileSystemWatchers.forEach(fileWatcher => fileWatcher.dispose());
    if (regionColorManager) regionColorManager.dispose();
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