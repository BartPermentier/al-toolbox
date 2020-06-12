const vscode = require('vscode');
const codeBlocks = require('../codeBlocks/codeBlocks');
const alFileManagement = require('../fileManagement/alFileManagement');
const fault = require('../fault');

const openBracked = /\{/g;
const closeBracked = /\}/g;

/**
 * @param {vscode.TextDocument} sourceDocument
 * @param {Array<vscode.TextDocument>} destinationDocuments
 */
exports.copyFieldsToRelatedTables = async (sourceDocument, destinationDocuments) => {
    const currentTableFields = getFields(sourceDocument);
    const faults = [];
    let nrFilesChanged = 0;
    let nrFieldsAdded = 0; 

    await Promise.all(destinationDocuments.map(async document => {
        const destTableFields = new Map();
        getFields(document).forEach(fieldInfo => destTableFields.set(fieldInfo.number, fieldInfo));
        
        const fieldsToAdd = [];
        // Get all fields in currentTableFields that are not in document
        currentTableFields.forEach(fieldInfo => {
            if (destTableFields.has(fieldInfo.number)) {
                const destFieldinfo = destTableFields.get(fieldInfo.number);
                if (destFieldinfo.name !== fieldInfo.name || destFieldinfo.type !== fieldInfo.type) {
                    const differentKind = destFieldinfo.name !== fieldInfo.name ? 'name' : 'type';

                    const objectInfo = new alFileManagement.AlObjectInfo(document);
                    const destFieldRegex = new RegExp(fieldRegex.source.replace('(?<no>\\d+)', destFieldinfo.number.toString()));
                    const match = destFieldRegex.exec(document.getText());
                    
                    faults.push(new fault.Fault(
                        `FieldNo ${fieldInfo.number} already exists in tableExtension ${objectInfo.name} with a different ${differentKind}: ${destFieldinfo[differentKind]} (instead of ${fieldInfo[differentKind]})`,
                        document.uri,
                        new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length))
                    ));
                }
            } else {
                fieldsToAdd.push(fieldInfo);
            }
        });

        if (fieldsToAdd.length > 0) {
            let fieldsText = "";
            fieldsToAdd.forEach(fieldInfo => {
                fieldsText += fieldInfo.body;
            });
            
            const text = codeBlocks.removeAllCommentsAndStrings(document.getText());
            const fieldsCodeBlocks = codeBlocks.findAllCodeBlocks(
                text,
                /\b(?<kind>fields)\s*(?=\{)/ig,
                openBracked,
                closeBracked
            )
            const lineNos = codeBlocks.getLineNumbersForLocations(text, fieldsCodeBlocks[0]);

            const edit = new vscode.WorkspaceEdit();
            edit.insert(document.uri, new vscode.Position(lineNos.end, 0), fieldsText);
            const appliedEdit = await vscode.workspace.applyEdit(edit);

            if (appliedEdit) {
                ++nrFilesChanged;
                nrFieldsAdded += fieldsToAdd.length;
                document.save();
            } else {
                faults.push(
                    new fault.Fault(`Failed to edit ${document.uri}`, document.uri, undefined));
            }
        }
    }));

    return {
        nrFilesChanged: nrFilesChanged,
        nrFieldsAdded: nrFieldsAdded,
        faults: faults
    }
}

const fieldRegex = /\b(?<kind>field)\s*\(\s*(?<no>\d+)\s*;\s*(?<name>"[^"]*"|\w+)\s*;\s*(?<type>[^\)]+)\s*\)/gm;
class FieldInfo {
    number;
    name;
    type;
    body;

    /**
     * @param {string} body
     */
    constructor(body){
        const match = fieldRegex.exec(body);
        this.number = Number(match.groups.no);
        this.name = match.groups.name.replace(/"/g, '');
        this.type = match.groups.type;
        this.body = body;
    }
}

/**
 * @param {vscode.TextDocument} document
 * @returns {FieldInfo[]}
 */
function getFields(document) {
    let text = document.getText();
    text = codeBlocks.removeAllCommentsAndStrings(text);
    let fields = codeBlocks.findAllCodeBlocks(text, fieldRegex, openBracked, closeBracked)
        .map(codeblock => {
            const lineNos = codeBlocks.getLineNumbersForLocations(text, codeblock);
            const range = new vscode.Range(
                new vscode.Position(lineNos.start, 0),
                new vscode.Position(lineNos.end+1, 0)
            );
            const body = document.getText(range);
            fieldRegex.lastIndex = 0;
            
            return new FieldInfo(body);
        });
    return fields;
}