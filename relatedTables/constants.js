exports.AlObjectTypes = {
    table: 'table',
    tableExtension: 'tableextension',
    page: 'page',
    pageExtension: 'pageextension',
    pageCustomization: 'pagecustomization',
    codeUnit: 'codeunit',
    report: 'report',
    query: 'query',
    profile: 'profile',
    XMLPort: 'xmlport'
}

exports.RelatedTables = [
    {
        folder: 'Contact',
        objectType: this.AlObjectTypes.tableExtension,
        objects: [
            { id: 18, name: 'Customer' },
            { id: 23, name: 'Vendor' },
            { id: 270, name: 'Bank Account' },
            { id: 5050, name: 'Contact' }
        ]
    },
    {
        folder: 'SalesHeader',
        objectType: this.AlObjectTypes.tableExtension,
        objects: [
            { id: 36, name: 'Sales Header' },
            { id: 110, name: 'Sales Shipment Header' },
            { id: 112, name: 'Sales Invoice Header' },
            { id: 114, name: 'Sales Cr.Memo Header' },
            { id: 5107, name: 'Sales Header Archive' },
            { id: 6660, name: 'Return Receipt Header' }
        ]
    },
    {
        folder: 'SalesLine',
        objectType: this.AlObjectTypes.tableExtension,
        objects: [
            { id: 37, name: 'Sales Line' },
            { id: 111, name: 'Sales Shipment Line' },
            { id: 113, name: 'Sales Invoice Line' },
            { id: 115, name: 'Sales Cr.Memo Line' },
            { id: 5108, name: 'Sales Line Archive' },
            { id: 6661, name: 'Return Receipt Line' }
        ]
    },
    {
        folder: 'PurchaseHeader',
        objectType: this.AlObjectTypes.tableExtension,
        objects: [
            { id: 38, name: 'Purchase Header' },
            { id: 120, name: 'Purch. Rcpt. Header' },
            { id: 122, name: 'Purch. Inv. Header' },
            { id: 124, name: 'Purch. Cr. Memo Hdr.' },
            { id: 5109, name: 'Purchase Header Archive' },
            { id: 6650, name: 'Return Shipment Header' }
        ]
    },
    {
        folder: 'PurchaseLine',
        objectType: this.AlObjectTypes.tableExtension,
        objects: [
            { id: 39, name: 'Purchase Line' },
            { id: 121, name: 'Purch. Rcpt. Line' },
            { id: 123, name: 'Purch. Inv. Line' },
            { id: 125, name: 'Purch. Cr. Memo Line' },
            { id: 5110, name: 'Purchase Line Archive' },
            { id: 6651, name: 'Return Shipment Line' }
        ]
    },
    {
        folder: 'Contact',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 21, name: 'Customer Card' },
            { id: 22, name: 'Customer List' },
            { id: 26, name: 'Vendor Card' },
            { id: 27, name: 'Vendor List' },
            { id: 370, name: 'Bank Account Card' },
            { id: 371, name: 'Bank Account List' },
            { id: 5050, name: 'Contact Card' },
            { id: 5052, name: 'Contact List' }
        ]
    },
    {
        folder: 'SalesHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 41, name: 'Sales Quote' },
            { id: 42, name: 'Sales Order' },
            { id: 43, name: 'Sales Invoice' },
            { id: 44, name: 'Sales Credit Memo' },
            { id: 130, name: 'Posted Sales Shipment' },
            { id: 132, name: 'Posted Sales Invoice' },
            { id: 134, name: 'Posted Sales Credit Memo' },
            { id: 143, name: 'Posted Sales Invoices' },
            { id: 144, name: 'Posted Sales Credit Memos' },
            { id: 6630, name: 'Sales Return Order' },
            { id: 9300, name: 'Sales Quotes' },
            { id: 9301, name: 'Sales Invoice List' },
            { id: 9302, name: 'Sales Credit Memos' },
            { id: 9304, name: 'Sales Return Order List' },
            { id: 9305, name: 'Sales Order List' }
        ]
    },
    {
        folder: 'SalesLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 46, name: 'Sales Order Subform' },
            { id: 47, name: 'Sales Invoice Subform' },
            { id: 95, name: 'Sales Quote Subform' },
            { id: 96, name: 'Sales Cr. Memo Subform' },
            { id: 131, name: 'Posted Sales Shpt. Subform' },
            { id: 133, name: 'Posted Sales Invoice Subform' },
            { id: 135, name: 'Posted Sales Cr. Memo Subform' },
            { id: 516, name: 'Sales Lines' },
            { id: 526, name: 'Posted Sales Invoice Lines' },
            { id: 6631, name: 'Sales Return Order Subform' }
        ]
    },
    {
        folder: 'PurchaseHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 49, name: 'Purchase Quote' },
            { id: 50, name: 'Purchase Order' },
            { id: 51, name: 'Purchase Invoice' },
            { id: 52, name: 'Purchase Credit Memo' },
            { id: 136, name: 'Posted Purchase Receipt' },
            { id: 138, name: 'Posted Purchase Invoice' },
            { id: 140, name: 'Posted Purchase Credit Memo' },
            { id: 145, name: 'Posted Purchase Receipts' },
            { id: 146, name: 'Posted Purchase Invoices' },
            { id: 147, name: 'Posted Purchase Credit Memos' },
            { id: 6640, name: 'Purchase Return Order' },
            { id: 6660, name: 'Posted Return Receipt' },
            { id: 9306, name: 'Purchase Quotes' },
            { id: 9307, name: 'Purchase List' },
            { id: 9308, name: 'Purchase Invoices' },
            { id: 9309, name: 'Purchase Credit Memos' },
            { id: 9311, name: 'Purchase Return Order List' }
        ]
    },
    {
        folder: 'Contact',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 54, name: 'Purchase Order Subform' },
            { id: 55, name: 'Purch. Invoice Subform' },
            { id: 97, name: 'Purchase Quote Subform' },
            { id: 98, name: 'Purch. Cr. Memo Subform' },
            { id: 137, name: 'Posted Purchase Rcpt. Subform' },
            { id: 139, name: 'Posted Purch. Invoice Subform' },
            { id: 141, name: 'Posted Purch. Cr. Memo Subform' },
            { id: 6641, name: 'Purchase Return Order Subform' }
        ]
    }
];