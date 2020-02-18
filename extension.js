// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require("path");
const fs = require("fs");
const constants_1 = require("./constants_1");
//const workspaceHelpers = require("./workspaceFolderHelpers");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	let disposable = vscode.commands.registerCommand('extension.createRelatedTables', function () {
        // The code you place here will be executed every time your command is executed
        const rootPath = getCurrentWorkspaceFolderPath();
        //vscode.window.showInformationMessage(rootPath);
        // if rootpath is empty then error
        if (!rootPath) {
            return Promise.reject("No AL workspace folder is active");
        }

        // tableextensions
        vscode.window.showInformationMessage(rootPath);
        let destinationPath = rootPath + '/src/tableextension';
        vscode.window.showInformationMessage(rootPath);
        createFolder(destinationPath);
        vscode.window.showInformationMessage('createRelatedTables!');
        
        //Contact
        createAlFile(destinationPath, constants_1.tableExtension, 18, 'Customer');
        createAlFile(destinationPath, constants_1.tableExtension, 23, 'Vendor');
        createAlFile(destinationPath, constants_1.tableExtension, 270, 'Bank Account');
        createAlFile(destinationPath, constants_1.tableExtension, 5050, 'Contact');
        //SalesHeader
        createAlFile(destinationPath, constants_1.tableExtension, 36, 'Sales Header');
        createAlFile(destinationPath, constants_1.tableExtension, 110, 'Sales Shipment Header');
        createAlFile(destinationPath, constants_1.tableExtension, 112, 'Sales Invoice Header');
        createAlFile(destinationPath, constants_1.tableExtension, 114, 'Sales Cr.Memo Header');
        createAlFile(destinationPath, constants_1.tableExtension, 5107, 'Sales Header Archive');
        createAlFile(destinationPath, constants_1.tableExtension, 6660, 'Return Receipt Header');
        //SalesLine
        createAlFile(destinationPath, constants_1.tableExtension, 37, 'Sales Line');
        createAlFile(destinationPath, constants_1.tableExtension, 111, 'Sales Shipment Line');
        createAlFile(destinationPath, constants_1.tableExtension, 113, 'Sales Invoice Line');
        createAlFile(destinationPath, constants_1.tableExtension, 115, 'Sales Cr.Memo Line');
        createAlFile(destinationPath, constants_1.tableExtension, 5108, 'Sales Line Archive');
        createAlFile(destinationPath, constants_1.tableExtension, 6661, 'Return Receipt Line');
        //PurchaseHeader
        createAlFile(destinationPath, constants_1.tableExtension, 38, 'Purchase Header');
        createAlFile(destinationPath, constants_1.tableExtension, 120, 'Purch. Rcpt. Header');
        createAlFile(destinationPath, constants_1.tableExtension, 122, 'Purch. Inv. Header');
        createAlFile(destinationPath, constants_1.tableExtension, 124, 'Purch. Cr. Memo Hdr.');
        createAlFile(destinationPath, constants_1.tableExtension, 5109, 'Purchase Header Archive');
        createAlFile(destinationPath, constants_1.tableExtension, 6650, 'Return Shipment Header');
        //PurchaseLine
        createAlFile(destinationPath, constants_1.tableExtension, 39, 'Purchase Line');
        createAlFile(destinationPath, constants_1.tableExtension, 121, 'Purch. Rcpt. Line');
        createAlFile(destinationPath, constants_1.tableExtension, 123, 'Purch. Inv. Line');
        createAlFile(destinationPath, constants_1.tableExtension, 125, 'Purch. Cr. Memo Line');
        createAlFile(destinationPath, constants_1.tableExtension, 5110, 'Purchase Line Archive');
        createAlFile(destinationPath, constants_1.tableExtension, 6651, 'Return Shipment Line');
        // pageextensions
        createAlFile(destinationPath, constants_1.pageExtension, 46, 'Sales Order Subform');
        

		// Display a message box to the user
		vscode.window.showInformationMessage('createRelatedTables!');
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;
///////////AL File Creation
function createAlFile(destinationPath, objectType, objectId, objectName){
    const newObjectId = objectId + 80000;
    let newObjectName = objectName.replace(/\s/g,'');
    newObjectName = newObjectName.replace('.', '');
    let fileName;
    let fileContent;
    // Generate File Name and Content
    if (objectType == constants_1.tableExtension) {
        fileName = 'Tab';
        fileContent = 
        `
{
    fields
    {

    }
}
        `
    } else {
        fileName = 'Pag';
        fileContent = 
        `
{
    layout
    {
    }

    actions
    {
    }
}
        `
    }
    fileName = fileName + objectId + '-' + 'Ext' + newObjectId + '.' + newObjectName + '.al';
    //vscode.window.showInformationMessage(fileName);
    //Generate Path
    const filePath = path.join(destinationPath, fileName);
    return existsFileAsync(filePath)
            .then(exists => {
            if (exists) {
                return filePath;
            }
            const contents =    objectType + ' ' + newObjectId + ' "' + newObjectName + '" extends "' +  objectName + '" //' + objectId + fileContent;
            return writeTextFileAsync(filePath, contents)
                .then(() => filePath);
            });  
}
///////////File Creation
function writeTextFileAsync(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, { encoding: "utf-8" }, e => {
            if (e) {
                return reject(e);
            }
            resolve(true);
        });
    });
}
function existsFileAsync(filename) {
    return new Promise(resolve => {
        fs.exists(filename, exists => {
            resolve(exists);
        });
    });
}
exports.existsFileAsync = existsFileAsync;

///////////Workspace Finder
function getCurrentWorkspaceFolderPath() {
    const currentWorkspaceFolder = getCurrentWorkspaceFolder();
    if (currentWorkspaceFolder) {
        return currentWorkspaceFolder.uri.fsPath;
    }
    return undefined;
}
function getCurrentWorkspaceFolder() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        if (activeEditor.document) {
            lastActiveWorkspace = getWorkspaceFolderFromPath(activeEditor.document.fileName);
            return lastActiveWorkspace;
        }
    }
}
function getWorkspaceFolderFromPath(path) {
    if (!Array.isArray(vscode.workspace.workspaceFolders) || vscode.workspace.workspaceFolders.length === 0) {
        lastActiveWorkspace = undefined;
        return lastActiveWorkspace;
    }
    // one workspace folder, this is the old folder/rootpath scenario.
    if (vscode.workspace.workspaceFolders.length === 1) {
        lastActiveWorkspace = vscode.workspace.workspaceFolders[0];
        return lastActiveWorkspace;
    }
    const uri = vscode.Uri.file(path);
    const workspace = vscode.workspace.getWorkspaceFolder(uri);
    return workspace;
}
///////////Folder Creation
function createFolder(dir) {
    if (fs.existsSync(dir)) return;
    if (!fs.existsSync(path.dirname(dir))) {
        this.makeDirSync(path.dirname(dir));
    }
    fs.mkdirSync(dir);
}
// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
let lastActiveWorkspace = undefined;