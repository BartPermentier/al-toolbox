// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require("path");
const fs = require("fs");
const constants_1 = require("./constants_1");
//const workspaceHelpers = require("./workspaceFolderHelpers");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const regionWrapper = require('./regionWrapper/regionWrapper');

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
        //vscode.window.showInformationMessage(rootPath);
        const baseDestinationPath = rootPath + '/src/';
        //vscode.window.showInformationMessage(rootPath);
        
        //Create Table Extension Folder
        let destinationPath = baseDestinationPath + constants_1.tableExtension + '/';
        createFolder(destinationPath);
        //Contact
        destinationPath = destinationPath + 'Contact/'
        createFolder(destinationPath);
        createAlFile(destinationPath, constants_1.tableExtension, 18, 'Customer');
        createAlFile(destinationPath, constants_1.tableExtension, 23, 'Vendor');
        createAlFile(destinationPath, constants_1.tableExtension, 270, 'Bank Account');
        createAlFile(destinationPath, constants_1.tableExtension, 5050, 'Contact');
        //SalesHeader
        destinationPath = baseDestinationPath + constants_1.tableExtension + '/SalesHeader/';
        createFolder(destinationPath);
        createAlFile(destinationPath, constants_1.tableExtension, 36, 'Sales Header');
        createAlFile(destinationPath, constants_1.tableExtension, 110, 'Sales Shipment Header');
        createAlFile(destinationPath, constants_1.tableExtension, 112, 'Sales Invoice Header');
        createAlFile(destinationPath, constants_1.tableExtension, 114, 'Sales Cr.Memo Header');
        createAlFile(destinationPath, constants_1.tableExtension, 5107, 'Sales Header Archive');
        createAlFile(destinationPath, constants_1.tableExtension, 6660, 'Return Receipt Header');
        //SalesLine
        destinationPath = baseDestinationPath + constants_1.tableExtension + '/SalesLine/';
        createFolder(destinationPath);
        createAlFile(destinationPath, constants_1.tableExtension, 37, 'Sales Line');
        createAlFile(destinationPath, constants_1.tableExtension, 111, 'Sales Shipment Line');
        createAlFile(destinationPath, constants_1.tableExtension, 113, 'Sales Invoice Line');
        createAlFile(destinationPath, constants_1.tableExtension, 115, 'Sales Cr.Memo Line');
        createAlFile(destinationPath, constants_1.tableExtension, 5108, 'Sales Line Archive');
        createAlFile(destinationPath, constants_1.tableExtension, 6661, 'Return Receipt Line');
        //PurchaseHeader
        destinationPath = baseDestinationPath + constants_1.tableExtension + '/PurchaseHeader/';
        createFolder(destinationPath);
        createAlFile(destinationPath, constants_1.tableExtension, 38, 'Purchase Header');
        createAlFile(destinationPath, constants_1.tableExtension, 120, 'Purch. Rcpt. Header');
        createAlFile(destinationPath, constants_1.tableExtension, 122, 'Purch. Inv. Header');
        createAlFile(destinationPath, constants_1.tableExtension, 124, 'Purch. Cr. Memo Hdr.');
        createAlFile(destinationPath, constants_1.tableExtension, 5109, 'Purchase Header Archive');
        createAlFile(destinationPath, constants_1.tableExtension, 6650, 'Return Shipment Header');
        //PurchaseLine
        destinationPath = baseDestinationPath + constants_1.tableExtension + '/PurchaseLine/';
        createFolder(destinationPath);
        createAlFile(destinationPath, constants_1.tableExtension, 39, 'Purchase Line');
        createAlFile(destinationPath, constants_1.tableExtension, 121, 'Purch. Rcpt. Line');
        createAlFile(destinationPath, constants_1.tableExtension, 123, 'Purch. Inv. Line');
        createAlFile(destinationPath, constants_1.tableExtension, 125, 'Purch. Cr. Memo Line');
        createAlFile(destinationPath, constants_1.tableExtension, 5110, 'Purchase Line Archive');
        createAlFile(destinationPath, constants_1.tableExtension, 6651, 'Return Shipment Line');

        // pageextensions
        //Create Page Extension Folder
        destinationPath = baseDestinationPath + constants_1.pageExtension + '/';
        createFolder(destinationPath);
        //Contact
        destinationPath = destinationPath + 'Contact/'
        createFolder(destinationPath);
        createAlFile(destinationPath, constants_1.pageExtension, 21, 'Customer Card');
        createAlFile(destinationPath, constants_1.pageExtension, 22, 'Customer List');
        createAlFile(destinationPath, constants_1.pageExtension, 26, 'Vendor Card');
        createAlFile(destinationPath, constants_1.pageExtension, 27, 'Vendor List');
        createAlFile(destinationPath, constants_1.pageExtension, 370, 'Bank Account Card');
        createAlFile(destinationPath, constants_1.pageExtension, 371, 'Bank Account List');
        createAlFile(destinationPath, constants_1.pageExtension, 5050, 'Contact Card');
        createAlFile(destinationPath, constants_1.pageExtension, 5052, 'Contact List');
        //SalesHeader
        destinationPath = baseDestinationPath + constants_1.pageExtension + '/SalesHeader/';
        createFolder(destinationPath);
        createAlFile(destinationPath, constants_1.pageExtension, 41, 'Sales Quote');
        createAlFile(destinationPath, constants_1.pageExtension, 42, 'Sales Order');
        createAlFile(destinationPath, constants_1.pageExtension, 43, 'Sales Invoice');
        createAlFile(destinationPath, constants_1.pageExtension, 44, 'Sales Credit Memo');
        createAlFile(destinationPath, constants_1.pageExtension, 130, 'Posted Sales Shipment');
        createAlFile(destinationPath, constants_1.pageExtension, 132, 'Posted Sales Invoice');
        createAlFile(destinationPath, constants_1.pageExtension, 134, 'Posted Sales Credit Memo');
        createAlFile(destinationPath, constants_1.pageExtension, 143, 'Posted Sales Invoices');
        createAlFile(destinationPath, constants_1.pageExtension, 144, 'Posted Sales Credit Memos');
        createAlFile(destinationPath, constants_1.pageExtension, 6630, 'Sales Return Order');
        createAlFile(destinationPath, constants_1.pageExtension, 9300, 'Sales Quotes');
        createAlFile(destinationPath, constants_1.pageExtension, 9301, 'Sales Invoice List');
        createAlFile(destinationPath, constants_1.pageExtension, 9302, 'Sales Credit Memos');
        createAlFile(destinationPath, constants_1.pageExtension, 9304, 'Sales Return Order List');
        createAlFile(destinationPath, constants_1.pageExtension, 9305, 'Sales Order List');
        //SalesLine
        destinationPath = baseDestinationPath + constants_1.pageExtension + '/SalesLine/';
        createFolder(destinationPath);
        createAlFile(destinationPath, constants_1.pageExtension, 46, 'Sales Order Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 47, 'Sales Invoice Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 95, 'Sales Quote Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 96, 'Sales Cr. Memo Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 131, 'Posted Sales Shpt. Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 133, 'Posted Sales Invoice Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 135, 'Posted Sales Cr. Memo Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 516, 'Sales Lines');
        createAlFile(destinationPath, constants_1.pageExtension, 526, 'Posted Sales Invoice Lines');
        createAlFile(destinationPath, constants_1.pageExtension, 6631, 'Sales Return Order Subform');
        //PurchaseHeader
        destinationPath = baseDestinationPath + constants_1.pageExtension + '/PurchaseHeader/';
        createFolder(destinationPath);
        createAlFile(destinationPath, constants_1.pageExtension, 49, 'Purchase Quote');
        createAlFile(destinationPath, constants_1.pageExtension, 50, 'Purchase Order');
        createAlFile(destinationPath, constants_1.pageExtension, 51, 'Purchase Invoice');
        createAlFile(destinationPath, constants_1.pageExtension, 52, 'Purchase Credit Memo');
        createAlFile(destinationPath, constants_1.pageExtension, 136, 'Posted Purchase Receipt');
        createAlFile(destinationPath, constants_1.pageExtension, 138, 'Posted Purchase Invoice');
        createAlFile(destinationPath, constants_1.pageExtension, 140, 'Posted Purchase Credit Memo');
        createAlFile(destinationPath, constants_1.pageExtension, 145, 'Posted Purchase Receipts');
        createAlFile(destinationPath, constants_1.pageExtension, 146, 'Posted Purchase Invoices');
        createAlFile(destinationPath, constants_1.pageExtension, 147, 'Posted Purchase Credit Memos');
        createAlFile(destinationPath, constants_1.pageExtension, 6640, 'Purchase Return Order');
        createAlFile(destinationPath, constants_1.pageExtension, 6660, 'Posted Return Receipt');
        createAlFile(destinationPath, constants_1.pageExtension, 9306, 'Purchase Quotes');
        createAlFile(destinationPath, constants_1.pageExtension, 9307, 'Purchase List');
        createAlFile(destinationPath, constants_1.pageExtension, 9308, 'Purchase Invoices');
        createAlFile(destinationPath, constants_1.pageExtension, 9309, 'Purchase Credit Memos');
        createAlFile(destinationPath, constants_1.pageExtension, 9311, 'Purchase Return Order List');
        //PurchaseLine
        destinationPath = baseDestinationPath + constants_1.pageExtension + '/PurchaseLine/';
        createFolder(destinationPath);
        createAlFile(destinationPath, constants_1.pageExtension, 54, 'Purchase Order Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 55, 'Purch. Invoice Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 97, 'Purchase Quote Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 98, 'Purch. Cr. Memo Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 137, 'Posted Purchase Rcpt. Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 139, 'Posted Purch. Invoice Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 141, 'Posted Purch. Cr. Memo Subform');
        createAlFile(destinationPath, constants_1.pageExtension, 6641, 'Purchase Return Order Subform');
        

		// Display a message box to the user
		vscode.window.showInformationMessage('Related Tables Created!');
	});

    context.subscriptions.push(disposable);
    
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