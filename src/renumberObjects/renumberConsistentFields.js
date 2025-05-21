const vscode = require('vscode');
const alFileManagement = require('../fileManagement/alFileManagement');
const constants = require('../constants');

const fieldRegex = /(?<=\bfield\s*\(\s*)\d+(?=\s*;)/g;

// Mapping f�r konsistente Umnummerierung
const fieldMapping = new Map();

/**
 * @param {vscode.TextDocument} document 
 * @param {vscode.WorkspaceEdit} edit
 * @param {number} startFrom The new numbers will start from this number, counting up.
 */
function addConsistentRenumberFieldsToEdit(document, edit, startFrom) {
    let text = document.getText();

    let match, fieldNoAndRange = [];
    while ((match = fieldRegex.exec(text))) {
        const startPos = document.positionAt(match.index);
        fieldNoAndRange.push({
            no: Number(match[0]),
            range: new vscode.Range(startPos, startPos.translate(0, match[0].length))
        });
    }

    if (fieldNoAndRange.length === 0) return false;

    fieldNoAndRange
        .sort((a, b) => a.no - b.no)
        .forEach(fieldInfo => {
            let newNumber;
            if (fieldMapping.has(fieldInfo.no)) {
                newNumber = fieldMapping.get(fieldInfo.no);
            } else {
                newNumber = startFrom++;
                fieldMapping.set(fieldInfo.no, newNumber);
            }
            edit.replace(document.uri, fieldInfo.range, `${newNumber}`);
        });
    return true;
}

/**
 * @param {vscode.TextDocument} document 
 * @param {number} startFrom The new numbers will start from this number, counting up.
 */
async function renumberConsistentFields(document, startFrom) {
    const edit = new vscode.WorkspaceEdit();
    if (addConsistentRenumberFieldsToEdit(document, edit, startFrom))
        return await vscode.workspace.applyEdit(edit);
    else
        return false;
}
exports.renumberConsistentFields = renumberConsistentFields;

/**
 * @param {number} startFromForTable The new numbers for tables will start from this number, counting up.
 * @param {number} startFromForTableExtension The new numbers for table extensions will start from this number, counting up.
 */
async function renumberConsistentAllFields(startFromForTable, startFromForTableExtension) {
    const uris = await vscode.workspace.findFiles('**/*.al');

    const increment = 100 / uris.length;
    const results = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Updating prefixes...",
        cancellable: false
    }, async progress => {

        return Promise.all(uris.map(uri => vscode.workspace.openTextDocument(uri).then(async document => {
            const objInfo = new alFileManagement.AlObjectInfo(document);
            let edited = false;
            switch (objInfo.type) {
                case constants.AlObjectTypes.table:
                    edited = await renumberConsistentFields(document, startFromForTable);
                    break;
                case constants.AlObjectTypes.tableExtension:
                    edited = await renumberConsistentFields(document, startFromForTableExtension);
                    break;
            }
            progress.report({ increment: increment });
            return edited;
        })
        ));
    });

    let docEditedCount = 0;
    results.forEach(edited => {
        if (edited) ++docEditedCount;
    });
    return docEditedCount;
}
exports.renumberConsistentAllFields = renumberConsistentAllFields;
