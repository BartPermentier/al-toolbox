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

exports.AlObjectTypesToFilePrefix = (AlObjectType) => {
    switch (AlObjectType) {
        case this.AlObjectTypes.table:
		case this.AlObjectTypes.tableExtension:
		    return 'Tab';
        case this.AlObjectTypes.page:
		case this.AlObjectTypes.pageExtension:
		case this.AlObjectTypes.pageCustomization:
		    return 'Pag';
        case this.AlObjectTypes.codeUnit:
		    return 'Cod';
        case this.AlObjectTypes.report:
		    return 'Rep';
        case this.AlObjectTypes.query:
		    return 'Que';
        case this.AlObjectTypes.profile:
		    return 'Prof';
        case this.AlObjectTypes.XMLPort:
            return 'Xml';
        default:
            return '';
    }
}

exports.AlObjectTypesToFullTypeName = (AlObjectType) => {
    switch (AlObjectType) {
        case this.AlObjectTypes.table:
		    return 'Table';
		case this.AlObjectTypes.tableExtension:
		    return 'TableExt';
        case this.AlObjectTypes.page:
            return 'Page';
		case this.AlObjectTypes.pageExtension:
            return 'PageExt';
		case this.AlObjectTypes.pageCustomization:
		    return 'PageCust';
        case this.AlObjectTypes.codeUnit:
		    return 'Codeunit';
        case this.AlObjectTypes.report:
		    return 'Report';
        case this.AlObjectTypes.query:
		    return 'Query';
        case this.AlObjectTypes.profile:
		    return 'Profile';
        case this.AlObjectTypes.XMLPort:
            return 'Xmlport';
        default:
            return '';
    }
}

exports.RelatedTables = [
    {
        table: 'Contact',
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
        table: 'Sales Header',
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
        table: 'Sales Line',
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
        table: 'Purchase Header',
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
        table: 'Purchase Line',
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
    //#region Pages form tables related to Contact
    {
        table: 'Contact',
        folder: 'Contact',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 5050, name: 'Contact Card' },
            { id: 5052, name: 'Contact List' }
        ]
    },
    {
        table: 'Customer',
        folder: 'Contact',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 21, name: 'Customer Card' },
            { id: 22, name: 'Customer List' }
        ]
    },
    {
        table: 'Vendor',
        folder: 'Contact',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 26, name: 'Vendor Card' },
            { id: 27, name: 'Vendor List' },
        ]
    },
    {
        table: 'Bank Account',
        folder: 'Contact',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 370, name: 'Bank Account Card' },
            { id: 371, name: 'Bank Account List' }
        ]
    },
    //#endregion
    //#region Pages form tables related to Sales Header
    {
        table: 'Sales Header',
		folder: 'SalesHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 41, name: 'Sales Quote' },
            { id: 42, name: 'Sales Order' },
            { id: 43, name: 'Sales Invoice' },
            { id: 44, name: 'Sales Credit Memo' },
            { id: 6630, name: 'Sales Return Order' },
            { id: 9300, name: 'Sales Quotes' },
            { id: 9301, name: 'Sales Invoice List' },
            { id: 9302, name: 'Sales Credit Memos' },
            { id: 9304, name: 'Sales Return Order List' },
            { id: 9305, name: 'Sales Order List' }
        ]
    },
    {
        table: 'Sales Shipment Header',
		folder: 'SalesHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 130, name: 'Posted Sales Shipment' },
            { id: 142, name: 'Posted Sales Shipments' }
        ]
    },
    {
        table: 'Sales Invoice Header',
		folder: 'SalesHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 132, name: 'Posted Sales Invoice' },
            { id: 143, name: 'Posted Sales Invoices' },
        ]
    },
    {
        table: 'Sales Cr.Memo Header',
		folder: 'SalesHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 134, name: 'Posted Sales Credit Memo' },
            { id: 144, name: 'Posted Sales Credit Memos' }
        ]
    },
    {
        table: 'Return Receipt Header',
		folder: 'SalesHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 6660, name: 'Posted Return Receipt' }
        ]
    },
    //#endregion
    //#region Pages form tables related to Sales Lines
    {
        table: 'Sales Line',
		folder: 'SalesLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 46, name: 'Sales Order Subform' },
            { id: 47, name: 'Sales Invoice Subform' },
            { id: 95, name: 'Sales Quote Subform' },
            { id: 96, name: 'Sales Cr. Memo Subform' },
            { id: 516, name: 'Sales Lines' },
            { id: 6631, name: 'Sales Return Order Subform' }
        ]
    },
    {
        table: 'Sales Shipment Line',
		folder: 'SalesLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 131, name: 'Posted Sales Shpt. Subform' }
        ]
    },
    {
        table: 'Sales Invoice Line',
		folder: 'SalesLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 133, name: 'Posted Sales Invoice Subform' },
            { id: 526, name: 'Posted Sales Invoice Lines' }
        ]
    },
    {
        table: 'Sales Cr.Memo Line',
		folder: 'SalesLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 135, name: 'Posted Sales Cr. Memo Subform' },
        ]
    },
    {
        table: 'Return Receipt Line',
		folder: 'SalesLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 6661, name: 'Posted Return Receipt Subform' }
        ]
    },
    //#endregion
    //#region Pages form tables related to Purchase Header
    {
        table: 'Purchase Header',
		folder: 'PurchaseHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 49, name: 'Purchase Quote' },
            { id: 50, name: 'Purchase Order' },
            { id: 51, name: 'Purchase Invoice' },
            { id: 52, name: 'Purchase Credit Memo' },
            { id: 6640, name: 'Purchase Return Order' },
            { id: 9306, name: 'Purchase Quotes' },
            { id: 9307, name: 'Purchase List' },
            { id: 9308, name: 'Purchase Invoices' },
            { id: 9309, name: 'Purchase Credit Memos' },
            { id: 9311, name: 'Purchase Return Order List' }
        ]
    },
    {
        table: 'Purch. Rcpt. Header',
		folder: 'PurchaseHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 145, name: 'Posted Purchase Receipts' },
            { id: 6660, name: 'Posted Return Receipt' }
        ]
    },
    {
        table: 'Purch. Inv. Header',
		folder: 'PurchaseHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 138, name: 'Posted Purchase Invoice' },
            { id: 146, name: 'Posted Purchase Invoices' }
        ]
    },
    {
        table: 'Purch. Cr. Memo Hdr.',
		folder: 'PurchaseHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 140, name: 'Posted Purchase Credit Memo' },
            { id: 147, name: 'Posted Purchase Credit Memos' }
        ]
    },
    {
        table: 'Return Shipment Header',
		folder: 'PurchaseHeader',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 6650, name: 'Posted Return Shipment' },
            { id: 6650, name: 'Posted Return Shipments' }
        ]
    },
    //#endregion
    //#region Pages form tables related to Purchase Line
    {
        table: 'Purchase Line',
		folder: 'PurchaseLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 54, name: 'Purchase Order Subform' },
            { id: 55, name: 'Purch. Invoice Subform' },
            { id: 97, name: 'Purchase Quote Subform' },
            { id: 98, name: 'Purch. Cr. Memo Subform' },
            { id: 6641, name: 'Purchase Return Order Subform' }
        ]
    },
    {
        table: 'Purch. Rcpt. Line',
		folder: 'PurchaseLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 137, name: 'Posted Purchase Rcpt. Subform' }
        ]
    },
    {
        table: 'Purch. Inv. Line',
		folder: 'PurchaseLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 139, name: 'Posted Purch. Invoice Subform' }
        ]
    },
    {
        table: 'Purch. Cr. Memo Line',
		folder: 'PurchaseLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 141, name: 'Posted Purch. Cr. Memo Subform' }
        ]
    },
    {
        table: 'Return Shipment Line',
		folder: 'PurchaseLine',
        objectType: this.AlObjectTypes.pageExtension,
        objects: [
            { id: 6651, name: 'Posted Return Shipment Subform' },
            { id: 6653, name: 'Posted Return Shipment Lines' }
        ]
    }
    //#endregion
];