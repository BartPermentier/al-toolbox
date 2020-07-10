const alFileManagement = require('../fileManagement/alFileManagement');
const fileManagement = require('../fileManagement/fileManagement');
const workspaceManagement = require('../fileManagement/workspaceManagement');
const constants = require('../constants');
const vscode = require("vscode");

const renumberableTypes = [
    constants.AlObjectTypes.XMLPort,
    constants.AlObjectTypes.codeUnit,
    constants.AlObjectTypes.page,
    constants.AlObjectTypes.pageExtension,
    constants.AlObjectTypes.query,
    constants.AlObjectTypes.report,
    constants.AlObjectTypes.table,
    constants.AlObjectTypes.tableExtension,
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

    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Renumbering...",
        cancellable: true
    }, async (progress, cancellationToken) => {
        const objectTypeToObjects = new Map();
        renumberableTypes.forEach(type => objectTypeToObjects.set(type, []));
        
        const currWorkspace = workspaceManagement.getCurrentWorkspaceFolderPath();
        let allALFiles = await vscode.workspace.findFiles('**/*.al');
        allALFiles = allALFiles.filter(file => file.fsPath.startsWith(currWorkspace));

        if (cancellationToken.isCancellationRequested) return [];
        
        const alObjects = await Promise.all(allALFiles.map(file => getAlObjectInfo(file)));
        alObjects.forEach(object => {
            if (object.id != null && objectTypeToObjects.has(object.type)){
                objectTypeToObjects.get(object.type).push(object);
            }
        });

        if (cancellationToken.isCancellationRequested) return [];

        const edit = new vscode.WorkspaceEdit();
        let idMappings = [];
        objectTypeToObjects.forEach((objects, type) => {
            let newIdMappings;
            if(constants.isExtensionType(type)) {
                newIdMappings = createExtensionObjectRenumberMapping(objects, numberRanges);
            } else {
                newIdMappings = createRenumberMapping(objects, numberRanges);
            }
            idMappings = idMappings.concat(newIdMappings);
        });

        if (cancellationToken.isCancellationRequested) return [];

        const progressIncrement = 100 / idMappings.length;
        const results = await Promise.all(idMappings.map(idMapping => {
            const result = renumberFile(idMapping.newId, idMapping.id, idMapping.path, edit);
            progress.report({increment: progressIncrement});
            return result;
        }));

        if (cancellationToken.isCancellationRequested) return [];
        
        if (await vscode.workspace.applyEdit(edit)) {
            return results;
        } else {
            return [];
        }
    });
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

/**
 * @param {{id: number, extendedId: number, path: vscode.Uri}[]} originalObjects
 * @param {{from: number, to: number}[]} newNumberRanges
 * @returns {{id: number, newId: number, path: vscode.Uri}[]}
 */
function createExtensionObjectRenumberMapping(originalObjects, newNumberRanges) {
    if (isInRange(constants.ExtensionObjectNumber, newNumberRanges) === -1) {
        return createRenumberMapping(originalObjects, newNumberRanges);
    }

    const toMapNormaly = originalObjects.filter(object => object.extendedId === undefined);
    let newIdMapping = createRenumberMapping(toMapNormaly, newNumberRanges);
   
    const toMapUsingExtendedObjecId = originalObjects.filter(object => object.extendedId !== undefined)
    if(toMapUsingExtendedObjecId.length > 0){
        const withId = toMapUsingExtendedObjecId
            .map((object) => Object.assign({newId: 0}, object))
            .sort((a, b) => a.id - b.id);
        const strIdPrefix = constants.ExtensionObjectNumber.toString();
        const zeros = strIdPrefix.replace(/[1-9]+/,'').length;
        
        newIdMapping = newIdMapping.concat(
            withId.map(mapping => {
                const idSuffix = mapping.extendedId % (10 ** zeros);
                mapping.newId = constants.ExtensionObjectNumber + idSuffix;
                return mapping;
            })
        );    
    }
    return newIdMapping;
}

/**
 * @param {number} number
 * @param {{from: number, to: number}[]} ranges
 * @returns {number} index of the range the number is in. Returns -1 if not in ranges.
 */
function isInRange(number, ranges) {
    for(let i = 0; i < ranges.length; ++i){
        if (ranges[i].from <= number && number <= ranges[i].to)
            return i;
    }
    return -1;
}

//#region File manipulation
/**
 * @param {vscode.TextDocument} textDocument
 */
function getNumberRanges(textDocument) {
    const appJson = JSON.parse(textDocument.getText());
    if (appJson.idRanges) return appJson.idRanges;
    if (appJson.idRange) return [appJson.idRange];
    throw `No idRanges or idRange property found in ${textDocument.uri.fsPath}`;
}

/**
 * @param {vscode.Uri} file
 */
async function getAlObjectInfo(file) {
    const textDocument = await vscode.workspace.openTextDocument(file);
    return new alFileManagement.AlObjectInfo(textDocument);
}

const objectIdRegex = /(?<=^\s*\w+\s+)\d+/m;
/**
 * @param {number} newNumber 
 * @param {number} oldNumber 
 * @param {vscode.Uri} file
 * @param {vscode.WorkspaceEdit} workspaceEdit
 */
async function renumberFile(newNumber, oldNumber, file, workspaceEdit) {
    if (newNumber === oldNumber) return false;
    const textDocument = await vscode.workspace.openTextDocument(file);
    const text = textDocument.getText();
    let match = objectIdRegex.exec(text);
    if (match === null) return false;

    workspaceEdit.replace(file, textDocument.getWordRangeAtPosition(textDocument.positionAt(match.index)), newNumber.toString());

    const fileContainsOldRegex = new RegExp(`${oldNumber}(?=[^/\\\\]*$)`);
    if ((match = fileContainsOldRegex.exec(file.path)) !== null) {
        // rename the file if oldNumber is in filename
        const newFileName = vscode.Uri.file(file.path.replace(fileContainsOldRegex, newNumber.toString()));
        workspaceEdit.renameFile(file, newFileName, {ignoreIfExists: true});
    }
    return true;
}
//#endregion