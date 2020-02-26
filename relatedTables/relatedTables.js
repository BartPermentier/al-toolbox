const constants = require('./constants');
const fileMangagement = require('./fileManagement');

/**
 * @returns {Promise}
 */
exports.createRelatedTables = () => {
    // The code you place here will be executed every time your command is executed
    const rootPath = fileMangagement.getCurrentWorkspaceFolderPath();
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
    let destinationPath = baseDestinationPath + constants.AlObjectTypes.tableExtension + '/';
    fileMangagement.createFolder(destinationPath);
    //Contact
    destinationPath = destinationPath + 'Contact/'
    fileMangagement.createFolder(destinationPath);
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 18, 'Customer');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 23, 'Vendor');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 270, 'Bank Account');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 5050, 'Contact');
    //SalesHeader
    destinationPath = baseDestinationPath + constants.AlObjectTypes.tableExtension + '/SalesHeader/';
    fileMangagement.createFolder(destinationPath);
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 36, 'Sales Header');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 110, 'Sales Shipment Header');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 112, 'Sales Invoice Header');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 114, 'Sales Cr.Memo Header');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 5107, 'Sales Header Archive');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 6660, 'Return Receipt Header');
    //SalesLine
    destinationPath = baseDestinationPath + constants.AlObjectTypes.tableExtension + '/SalesLine/';
    fileMangagement.createFolder(destinationPath);
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 37, 'Sales Line');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 111, 'Sales Shipment Line');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 113, 'Sales Invoice Line');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 115, 'Sales Cr.Memo Line');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 5108, 'Sales Line Archive');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 6661, 'Return Receipt Line');
    //PurchaseHeader
    destinationPath = baseDestinationPath + constants.AlObjectTypes.tableExtension + '/PurchaseHeader/';
    fileMangagement.createFolder(destinationPath);
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 38, 'Purchase Header');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 120, 'Purch. Rcpt. Header');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 122, 'Purch. Inv. Header');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 124, 'Purch. Cr. Memo Hdr.');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 5109, 'Purchase Header Archive');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 6650, 'Return Shipment Header');
    //PurchaseLine
    destinationPath = baseDestinationPath + constants.AlObjectTypes.tableExtension + '/PurchaseLine/';
    fileMangagement.createFolder(destinationPath);
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 39, 'Purchase Line');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 121, 'Purch. Rcpt. Line');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 123, 'Purch. Inv. Line');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 125, 'Purch. Cr. Memo Line');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 5110, 'Purchase Line Archive');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.tableExtension, 6651, 'Return Shipment Line');

    // pageextensions
    //Create Page Extension Folder
    destinationPath = baseDestinationPath + constants.AlObjectTypes.pageExtension + '/';
    fileMangagement.createFolder(destinationPath);
    //Contact
    destinationPath = destinationPath + 'Contact/'
    fileMangagement.createFolder(destinationPath);
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 21, 'Customer Card');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 22, 'Customer List');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 26, 'Vendor Card');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 27, 'Vendor List');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 370, 'Bank Account Card');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 371, 'Bank Account List');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 5050, 'Contact Card');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 5052, 'Contact List');
    //SalesHeader
    destinationPath = baseDestinationPath + constants.AlObjectTypes.pageExtension + '/SalesHeader/';
    fileMangagement.createFolder(destinationPath);
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 41, 'Sales Quote');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 42, 'Sales Order');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 43, 'Sales Invoice');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 44, 'Sales Credit Memo');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 130, 'Posted Sales Shipment');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 132, 'Posted Sales Invoice');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 134, 'Posted Sales Credit Memo');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 143, 'Posted Sales Invoices');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 144, 'Posted Sales Credit Memos');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 6630, 'Sales Return Order');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 9300, 'Sales Quotes');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 9301, 'Sales Invoice List');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 9302, 'Sales Credit Memos');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 9304, 'Sales Return Order List');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 9305, 'Sales Order List');
    //SalesLine
    destinationPath = baseDestinationPath + constants.AlObjectTypes.pageExtension + '/SalesLine/';
    fileMangagement.createFolder(destinationPath);
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 46, 'Sales Order Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 47, 'Sales Invoice Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 95, 'Sales Quote Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 96, 'Sales Cr. Memo Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 131, 'Posted Sales Shpt. Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 133, 'Posted Sales Invoice Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 135, 'Posted Sales Cr. Memo Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 516, 'Sales Lines');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 526, 'Posted Sales Invoice Lines');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 6631, 'Sales Return Order Subform');
    //PurchaseHeader
    destinationPath = baseDestinationPath + constants.AlObjectTypes.pageExtension + '/PurchaseHeader/';
    fileMangagement.createFolder(destinationPath);
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 49, 'Purchase Quote');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 50, 'Purchase Order');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 51, 'Purchase Invoice');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 52, 'Purchase Credit Memo');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 136, 'Posted Purchase Receipt');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 138, 'Posted Purchase Invoice');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 140, 'Posted Purchase Credit Memo');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 145, 'Posted Purchase Receipts');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 146, 'Posted Purchase Invoices');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 147, 'Posted Purchase Credit Memos');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 6640, 'Purchase Return Order');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 6660, 'Posted Return Receipt');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 9306, 'Purchase Quotes');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 9307, 'Purchase List');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 9308, 'Purchase Invoices');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 9309, 'Purchase Credit Memos');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 9311, 'Purchase Return Order List');
    //PurchaseLine
    destinationPath = baseDestinationPath + constants.AlObjectTypes.pageExtension + '/PurchaseLine/';
    fileMangagement.createFolder(destinationPath);
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 54, 'Purchase Order Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 55, 'Purch. Invoice Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 97, 'Purchase Quote Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 98, 'Purch. Cr. Memo Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 137, 'Posted Purchase Rcpt. Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 139, 'Posted Purch. Invoice Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 141, 'Posted Purch. Cr. Memo Subform');
    fileMangagement.createAlFile(destinationPath, constants.AlObjectTypes.pageExtension, 6641, 'Purchase Return Order Subform');

    return Promise.resolve();
}