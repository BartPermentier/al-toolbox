const alFileManagement = require('../fileManagement/alFileManagement');
const fileManagement = require('../fileManagement/fileManagement');
const workspaceManagement = require('../fileManagement/workspaceManagement');
const constants = require('../constants');
const vscode = require("vscode");

const renumberableTypes = [
    constants.AlObjectTypes.XMLPort,
    constants.AlObjectTypes.codeUnit,
    constants.AlObjectTypes.page,
    constants.AlObjectTypes.query,
    constants.AlObjectTypes.report,
    constants.AlObjectTypes.table,
    constants.AlObjectTypes.enum
]

/**
 * Renumbers all AL objects with new ids that fit in the ranges found in app.json.
 * This only works for workspaces with one app.json file.
 */
exports.renumberAll = async function renumberAll() {
    const appFile = await fileManagement.getAppFile();

    const appDocument = await vscode.workspace.openTextDocument(appFile);
    const numberRanges = getNumberRanges(appDocument);

    const opbjectTypeIncrement = 100 / renumberableTypes.length;
    return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
			title: "Renumbering...",
			cancellable: false
        }, (progress) => Promise.all(renumberableTypes.map(async objectType => {

            // Get all AL files for object type in currentWorkspaceFolder
            const currWorkspace = workspaceManagement.getCurrentWorkspaceFolderPath()
            let files = await vscode.workspace.findFiles('**/' + alFileManagement.getFileFormatForType(objectType));
            files = files.filter(file => file.fsPath.startsWith(currWorkspace));

            if (files.length === 0) {
                progress.report({increment: opbjectTypeIncrement});
                return [];
            }
            // Get id foreach file
            let originalObjects = await Promise.all(files.map(file => mapFileToIdUriPair(file, objectType)));
            // exclude files where no id is found, this should also filter out files with incorrect object types.
            originalObjects = originalObjects.filter(object => object.id !== null);
            // Get new id to use foreach file
            const newIdMappings = createRenumberMapping(originalObjects, numberRanges);

            const progressIncrement = opbjectTypeIncrement / files.length;
            return Promise.all(newIdMappings.map(async newIdMapping => {
                const result = await renumberFile(newIdMapping.newId, newIdMapping.id, newIdMapping.path);
                progress.report({increment: progressIncrement});
                return result;
            }));
        }))
    );
}

/**
 * @param {{id: number, path: vscode.Uri}[]} originalObjects
 * @param {{from: number, to: number}[]} newNumberRanges
 * @returns {{id: number, newId: number, path: vscode.Uri}[]}
 */
function createRenumberMapping(originalObjects, newNumberRanges) {
    let newIdMapping = originalObjects
        .map((object) => Object.assign({newId: 0}, object))
        .sort((a, b) => a.id - b.id);
    
    let currentNumberRange = 0;
    let currentNo = newNumberRanges[currentNumberRange].from;
    let lastNo = newNumberRanges[currentNumberRange].to;

    newIdMapping.forEach(object => {
        object.newId = currentNo++;
        if (currentNo > lastNo) {
            ++currentNumberRange;
            if (currentNumberRange >= newNumberRanges.length)
                throw "Not enough numbers in new number range";
            currentNo = newNumberRanges[currentNumberRange].from;
            lastNo = newNumberRanges[currentNumberRange].to;
        } 
    });

    return newIdMapping;
}

//#region File manipulation
/**
 * @param {vscode.TextDocument} textDocument
 */
function getNumberRanges(textDocument) {
    const appJson = JSON.parse(textDocument.getText());
    return appJson.idRanges;
}

/**
 * @param {vscode.Uri} file
 * @param {string} objectType
 */
async function mapFileToIdUriPair(file, objectType) {
    return {
        id: await getObjectId(file, objectType),
        path: file
    };
}

/**
 * @param {vscode.Uri} file
 * @param {string} objectType
 * @returns {Thenable<number>}
 */
function getObjectId(file, objectType) {
    return vscode.workspace.openTextDocument(file).then(
        textDocument => {
            const text = textDocument.getText();
            const objectIdRegex = new RegExp(`(?<=^${objectType}\\s+)\\d+`);
            const match = objectIdRegex.exec(text);
            if (match !== null) {
                return Number(match[0]);
            } else {
                return null;
            }
        }
    );
}

const objectIdRegex = /(?<=^\w+\s+)\d+/;
/**
 * @param {number} newNumber 
 * @param {number} oldNumber 
 * @param {vscode.Uri} file
 */
async function renumberFile(newNumber, oldNumber, file) {
    if (newNumber === oldNumber) return false;
    const textDocument = await vscode.workspace.openTextDocument(file);
    const text = textDocument.getText();
    let match = objectIdRegex.exec(text);
    if (match === null) return null;

    let workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.replace(file, textDocument.getWordRangeAtPosition(textDocument.positionAt(match.index)), newNumber.toString());
    let result = vscode.workspace.applyEdit(workspaceEdit);


    const fileContainsOldRegex = new RegExp(`${oldNumber}(?=[^/\\\\]*$)`);
    if ((match = fileContainsOldRegex.exec(file.path)) !== null) {
        // rename the file if oldNumber is in filename
        const newFileName = vscode.Uri.file(file.path.replace(fileContainsOldRegex, newNumber.toString()));
        let workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.renameFile(file, newFileName, {ignoreIfExists: true});
        await result;
        result = vscode.workspace.applyEdit(workspaceEdit);
    }

    return result;
}
//#endregion