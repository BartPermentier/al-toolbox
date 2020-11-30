const { textSpanIsEmpty } = require('typescript');
const vscode = require('vscode');

/**
 * Manages Diagnostics for all workspace folders.
 */
exports.DiagnosticManager = class DiagnosticManager {
    fileFormatFilter;
    workspaceDiagnosticManagers = new Map();
    disposables = [];
    enabledSetting;
    
    /**
     * @param {function(vscode.Uri): Thenable<vscode.Diagnostic[]>} createDiagnosticMethod
     * @param {string} fileFormatFilter A file glob pattern like *.{ts,js} that will be matched on file paths relative to the base path.
     * @param {string} enabledSetting vscode setting in ALTB that enables this Diagnostic type
     */
    constructor(createDiagnosticMethod, fileFormatFilter, enabledSetting = undefined) {
        this.createDiagnosticMethod = createDiagnosticMethod;
        this.fileFormatFilter = fileFormatFilter;
        this.enabledSetting = enabledSetting;
        this.activate();
    }

    activate() {
        vscode.workspace.workspaceFolders.forEach(workspaceFolder => {
            this.watchWorkspace(workspaceFolder);
        });
        this.disposables.push(
            vscode.workspace.onDidChangeWorkspaceFolders(e => {
                e.added.forEach(workspaceFolder => this.watchWorkspace(workspaceFolder));
                e.removed.forEach(workspaceFolder => this.stopWatchingWorkspace(workspaceFolder));
            })
        );
    }

    /**
     * @param {vscode.WorkspaceFolder} workspaceFolder 
     */
    watchWorkspace(workspaceFolder) {
        if (
            this.isEnabledFor(workspaceFolder) &&
            !this.workspaceDiagnosticManagers.has(workspaceFolder.uri.fsPath)
        ) {
            this.workspaceDiagnosticManagers.set(
                workspaceFolder.uri.fsPath, 
                new WorkspaceDiagnosticManager(workspaceFolder, this.createDiagnosticMethod, this.fileFormatFilter)
            );
        }
    }

    /**
     * @param {vscode.WorkspaceFolder} workspaceFolder 
     */
    stopWatchingWorkspace(workspaceFolder) {
        let workspaceDiagnosticManager;
        if (workspaceDiagnosticManager = this.workspaceDiagnosticManagers.get(workspaceFolder.uri.fsPath)) {
            workspaceDiagnosticManager.dispose();
            this.workspaceDiagnosticManagers.delete(workspaceFolder.uri.fsPath);
        }
    }

    /**
     * @param {vscode.WorkspaceFolder} workspaceFolder 
     */
    isEnabledFor(workspaceFolder) {
        return (this.enabledSetting == undefined) ||
            vscode.workspace.getConfiguration('ALTB', workspaceFolder.uri).get(this.enabledSetting);
    }

    dispose() {
        this.disposables.forEach(disposable => {
            disposable.dispose();
        });
        this.workspaceDiagnosticManagers.forEach(
            workspaceDiagnosticManager => workspaceDiagnosticManager.dispose()
        );
        this.workspaceDiagnosticManagers.clear();
    }
}

/**
 * Manages Diagnostics for a specific workspace folder.
 */
class WorkspaceDiagnosticManager {
    fileSystemWatcher;
    fileFormatFilter;
    createDiagnosticMethod;
    diagnosticsCollection;

    /**
     * @param {vscode.WorkspaceFolder} workspaceFolder 
     * @param {function(vscode.Uri): Thenable<vscode.Diagnostic[]>} createDiagnosticMethod
     * @param {string} fileFormatFilter A file glob pattern like *.{ts,js} that will be matched on file paths relative to the base path of workspaceFolder.
     */
    constructor(workspaceFolder, createDiagnosticMethod, fileFormatFilter) {
        this.createDiagnosticMethod = createDiagnosticMethod;
        this.fileFormatFilter = new vscode.RelativePattern(workspaceFolder, fileFormatFilter);
        this.diagnosticsCollection = vscode.languages.createDiagnosticCollection(`AL-Toolbox Comment Translation Diagnostics Workspace:${workspaceFolder.name}`);
        this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher(this.fileFormatFilter);
            
        this.fileSystemWatcher.onDidCreate(uri => {
            this.updateDiagnostics(uri);
        });
        this.fileSystemWatcher.onDidDelete(uri => {
            this.diagnosticsCollection.delete(uri);
        });
        this.fileSystemWatcher.onDidChange(uri => {
            this.updateDiagnostics(uri);
        });

        vscode.workspace.findFiles(this.fileFormatFilter)
            .then(uris => uris.forEach(uri => this.updateDiagnostics(uri)));
    }

    /**
     * @param {vscode.Uri} uri 
     */
    async updateDiagnostics(uri) {
        this.diagnosticsCollection.delete(uri);
        this.diagnosticsCollection.set(
            uri,
            await this.createDiagnosticMethod(uri)
        );
    }

    dispose() {
        if (this.fileSystemWatcher) this.fileSystemWatcher.dispose();
        this.diagnosticsCollection.dispose();
    }
}