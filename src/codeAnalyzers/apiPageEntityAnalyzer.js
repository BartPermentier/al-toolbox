const vscode = require('vscode');
const fileManagement = require('../fileManagement/fileManagement');
const alFileManagement = require('../fileManagement/alFileManagement');
const constants = require('../constants');

const DuplicateEntityNameErrMsg = 'Duplicate EntityName';
const DuplicateEntitySetNameErrMsg = 'Duplicate EntitySetName';

const EntityType = {
    EntityName: 'EntityName',
    EntitySetName: 'EntitySetName',
}

const pageTypeReg = /\bPageType\s*=\s*(\w+)\s*;/i;
const apiPublisherReg = /\bAPIPublisher\s*=\s*'([^']+)'\s*;/i;
const apiGroupReg = /\bAPIGroup\s*=\s*'([^']+)'\s*;/i;
const apiVersionReg = /\bAPIVersion\s*=\s*'([^']+)'\s*;/i;
const entityNameReg = /\bEntityName\s*=\s*'([^']+)'\s*;/i;
const entitySetNameReg = /\bEntitySetName\s*=\s*'([^']+)'\s*;/i;
const NotAnApiPage = 'Not an API page';

class ApiPageEntityInfo {
    apiPublisher;
    apiGroup;
    apiVersion;
    entityName;
    entitySetName;

    getPath() {
        return this.fileUri.fsPath;
    }
    fileUri;
    entityRange;
    entitySetRange;
    isAPIPage;

    /**
     * @param {vscode.TextDocument} textDocument 
     */
    constructor(textDocument){
        this.initInfo(textDocument);
    }
    
    /**
     * @param {vscode.TextDocument} textDocument 
     */
    initInfo(textDocument) {
        this.fileUri = textDocument.uri;
        
        var fileContent = textDocument.getText();
        var match = pageTypeReg.exec(fileContent);
        if(!match || match[1].toUpperCase() !== 'API') {
            this.isAPIPage = false;
            return this.isAPIPage;
        };
        this.isAPIPage = true;
        
        this.apiPublisher = apiPublisherReg.exec(fileContent)[1];
        this.apiGroup = apiGroupReg.exec(fileContent)[1];
        this.apiVersion = apiVersionReg.exec(fileContent)[1];

        match = entityNameReg.exec(fileContent);
        this.entityName = match[1];
        this.entityRange = fileManagement.getMatchRange(match);

        match = entitySetNameReg.exec(fileContent);
        this.entitySetName = match[1];
        this.entitySetRange = fileManagement.getMatchRange(match);
        return this.isAPIPage;
    }

    asKey(type) {
        return `${this.apiPublisher}|${this.apiGroup}|${this.apiVersion}|${
            type === EntityType.EntityName ? this.entityName : this.entitySetName
        }`;
    }

    getAsDiagnostic(type) {
        switch(type) {
            case EntityType.EntityName:
                return this.getAsEntityDiagnostic();
            case EntityType.EntitySetName:
                return this.getAsEntitySetDiagnostic();
            default:
                throw `Type '${type}' is not supported`;
        }
    }

    getAsEntityDiagnostic() {
        return new vscode.Diagnostic(this.entityRange, DuplicateEntityNameErrMsg, vscode.DiagnosticSeverity.Error);
    }

    getAsEntitySetDiagnostic() {
        return new vscode.Diagnostic(this.entitySetRange, DuplicateEntitySetNameErrMsg, vscode.DiagnosticSeverity.Error);
    }
}

class ApiPageEntityAnalyzer {
    byEntitySetName = new Map();
    byEntityName = new Map();
    byPath = new Map();
    diagnosticEntityNameCollection = vscode.languages.createDiagnosticCollection('AL-Toolbox API Page EntityName Diagnostics');
    diagnosticEntitySetNameCollection = vscode.languages.createDiagnosticCollection('AL-Toolbox API Page EntitySetName Diagnostics');

    constructor() {
        this.init();
    }

    init() {
        vscode.workspace.findFiles('**/' + alFileManagement.getFileFormatForType(constants.AlObjectTypes.page))
            .then(fileURIs => {
                this.analyzeFiles(fileURIs);
            });
    }

    /**
     * @param {string} type
     */
    getMapForType(type) {
        switch(type) {
            case EntityType.EntityName:
                return this.byEntityName;
            case EntityType.EntitySetName:
                return this.byEntitySetName;
            default:
                throw `Unknown EntityType: '${type}'`;
        }
    }

    /**
     * @param {ReadonlyArray<vscode.Uri>} fileURIs 
     */
    async analyzeFiles(fileURIs, updateDiagnostics = true) {
        let didChange = false;
        await Promise.all(fileURIs.map(async uri => {
            const textDocument = await vscode.workspace.openTextDocument(uri)
            let apiPageEntityInfo = new ApiPageEntityInfo(textDocument);
            if (apiPageEntityInfo.isAPIPage){
                if(this.byPath.has(uri.fsPath)) {
                    this.update(apiPageEntityInfo);
                } else {
                    this.addToMaps(apiPageEntityInfo);
                }
                didChange = true;
            }
        }));
        if(didChange && updateDiagnostics) { this.createDiagnostics(); }
    }

    //#region Remove
    /**
     * @param {ReadonlyArray<vscode.Uri>} fileURIs 
     */
    removeFiles(fileURIs, updateDiagnostics = true) {
        let didRemove = false;
        fileURIs.forEach(uri => {
            if(this.byPath.has(uri.fsPath)) {
                this.removeEntity(this.byPath.get(uri.fsPath));
                didRemove = true;
            }
        });
        if(didRemove && updateDiagnostics) { this.createDiagnostics(); }
    }

    /**
     * @param {ApiPageEntityInfo} apiPageEntityInfo
     */
    removeEntity(apiPageEntityInfo) {
        this.byPath.delete(apiPageEntityInfo.getPath());
        this.removeFromMap(apiPageEntityInfo, EntityType.EntityName);
        this.diagnosticEntityNameCollection.delete(apiPageEntityInfo.fileUri);
        this.removeFromMap(apiPageEntityInfo, EntityType.EntitySetName);
        this.diagnosticEntitySetNameCollection.delete(apiPageEntityInfo.fileUri);
    }
    
    /**
     * @param {ApiPageEntityInfo} apiPageEntityInfo 
     * @param {string} entityType 
     */
    removeFromMap(apiPageEntityInfo, entityType) {
        const entityMap = this.getMapForType(entityType);
        let entities;
        const key = apiPageEntityInfo.asKey(entityType);
        if(entities = entityMap.get(key)) {
            entities = entities.filter(entity => entity !== apiPageEntityInfo);
            if(entities.length === 0) {
                entityMap.delete(key);
            } else {
                entityMap.set(key, entities);
            }
        }
    }

    /**
     * @param {vscode.Uri} uri 
     */
    removeFilesInFolder(uri) {
        this.byPath.forEach((_, key) => {
            if (key.includes(uri.fsPath)) {
                this.removeEntity(this.byPath.get(key));
            }
        });
    }
    //#endregion

    /**
     * @param {ApiPageEntityInfo} apiPageEntityInfo
     */
    update(apiPageEntityInfo) {
        this.removeEntity(this.byPath.get(apiPageEntityInfo.getPath()));
        this.addToMaps(apiPageEntityInfo);
    }

    //#region Add
    /**
     * @param {ApiPageEntityInfo} apiPageEntityInfo
     */
    addToMaps(apiPageEntityInfo) {
        this.byPath.set(apiPageEntityInfo.getPath(), apiPageEntityInfo);
        this.add(apiPageEntityInfo, EntityType.EntityName);
        this.add(apiPageEntityInfo, EntityType.EntitySetName);
    }

    /**
     * @param {ApiPageEntityInfo} apiPageEntityInfo
     * @param {string} apiPageEntityInfo
     */
    add(apiPageEntityInfo, type) {
        const currMap = this.getMapForType(type)
        const key = apiPageEntityInfo.asKey(type);
        if (!currMap.has(key)) {
            currMap.set(key, [apiPageEntityInfo]);
        } else {
            currMap.get(key).push(apiPageEntityInfo);
        }
    }
    //#endregion

    //#region Diagnostics
    createDiagnostics() {
        let diagnostics = []
        this.byEntityName.forEach(entries => {
            diagnostics = diagnostics.concat(this.createDiagnosticsFor(entries, EntityType.EntityName));
        });
        this.diagnosticEntityNameCollection.set(diagnostics);
        diagnostics = []
        this.byEntitySetName.forEach(entries => {
            diagnostics = diagnostics.concat(this.createDiagnosticsFor(entries, EntityType.EntitySetName));
        });
        this.diagnosticEntitySetNameCollection.set(diagnostics);
    }

    /**
     * @param {Array<ApiPageEntityInfo>} apiPageEntitiesInfo 
     */
    createDiagnosticsFor(apiPageEntitiesInfo, type) {
        const diagnostics = []
        if (apiPageEntitiesInfo.length > 1) {
            apiPageEntitiesInfo.forEach(apiPageEntity => {
                diagnostics.push([apiPageEntity.fileUri, [apiPageEntity.getAsDiagnostic(type)]]);
            });
        } else {
            apiPageEntitiesInfo.forEach(apiPageEntity => {
                diagnostics.push([apiPageEntity.fileUri, undefined]);
            });
        }
        return diagnostics;
    }
    //#endregion
}
exports.ApiPageEntityAnalyzer = ApiPageEntityAnalyzer;

/**
 * 
 * @param {string|vscode.WorkspaceFolder} workspaceFolder 
 * @param {ApiPageEntityAnalyzer} apiPageEntityAnalyzer 
 */
function createFileSystemWatcher(workspaceFolder, apiPageEntityAnalyzer) {
    const pageFilePattern =
        new vscode.RelativePattern(workspaceFolder, '**/' + alFileManagement.getFileFormatForType(constants.AlObjectTypes.page));
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher(pageFilePattern);
    fileSystemWatcher.onDidCreate(uri => {
        apiPageEntityAnalyzer.analyzeFiles([uri]);
    });
    fileSystemWatcher.onDidDelete(uri => {
        apiPageEntityAnalyzer.removeFiles([uri]);
    });
    fileSystemWatcher.onDidChange(uri => {
        apiPageEntityAnalyzer.analyzeFiles([uri]);
    });
    return fileSystemWatcher;
}
exports.createFileSystemWatcher = createFileSystemWatcher;