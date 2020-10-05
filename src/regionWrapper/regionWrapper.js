const vscode = require('vscode');
const codeBlocks = require('../codeBlocks/codeBlocks');
const fileManagement = require('../fileManagement/fileManagement');

const regionStartRegex = /\s*(\/\/\s*)?#region\b/;

const alFunctionRegex = /(\[[^\]]+\]\s*)?(\blocal\b\s*)?\b(?<kind>trigger|procedure)\b\s+(\w+|"[^"]*")\s*\(/gi;
const beginRegex = /\bbegin\b|\bcase\b/gi;
const endRegex = /\bend;?\b/gi;
/**
 * @param {vscode.TextEditorEdit} editBuilder
 * @param {vscode.TextDocument} document
 * @param {{start: string, end: string}} regionFormat
 */
exports.WrapAllFunctions = (editBuilder, document, regionFormat) => {
    let text = document.getText();
    text = codeBlocks.removeAllCommentsAndStrings(text);

    let alFunctionLocations = codeBlocks.findAllCodeBlocks(text, alFunctionRegex, beginRegex, endRegex);
    alFunctionLocations.forEach(location => {
        const lineNos = codeBlocks.getLineNumbersForLocations(text, location);
        location.start = lineNos.start;
        location.end = lineNos.end;
    });

    let regionCount = 0;
    alFunctionLocations.forEach(location => {
        if ((location.start === 0) ||
                !regionStartRegex.test(document.lineAt(location.start - 1).text)) { // check if line before function does not contain a region
            const regionName = getRegionNameForAlFunction(document, location.start);
            addRegionStart(editBuilder, document.lineAt(location.start), regionName, regionFormat.start);
            addRegionEnd(editBuilder, document.lineAt(location.end), regionName, regionFormat.end);
            ++regionCount;
        }
    });

    return regionCount;
}

const DataItemOrColumnRegex = /\b(?<kind>dataitem|column)\b\s*\(/gi;
/**
 * @param {vscode.TextEditorEdit} editBuilder
 * @param {vscode.TextDocument} document
 * @param {Boolean} skipSingelInstance If skipSingelInstance is true, dataitems or columns that are not followed by another don't get regions
 * @param {{start: string, end: string}} regionFormat
 */
exports.WrapAllDataItemsAndColumns = (editBuilder, document, skipSingelInstance, regionFormat) => {
    let editor = vscode.window.activeTextEditor;
    let text = document.getText();
    text = codeBlocks.removeAllCommentsAndStrings(text);

    let dataitemAndColumnLocations = codeBlocks.findAllCodeBlocks(text, DataItemOrColumnRegex, /\{/g, /\}/g);
    dataitemAndColumnLocations.forEach(location => {
        const lineNos = codeBlocks.getLineNumbersForLocations(text, location);
        location.start = lineNos.start;
        location.end = lineNos.end;
    });
    let concatinatedBloks = codeBlocks.concatCodeBlocksNextToEachOther(dataitemAndColumnLocations, true);

    let regionCount = 0;
    concatinatedBloks.forEach(location => {
        if (!(skipSingelInstance && location.concatCount === 1)) {
            if ((location.start === 0) ||
                    !regionStartRegex.test(document.lineAt(location.start - 1).text)) { // check if line before function does not contain a region
                let regionName = location.kind;
                if (location.concatCount > 1) regionName += 's';
                addRegionStart(editBuilder, document.lineAt(location.start), regionName, regionFormat.start);
                addRegionEnd(editBuilder, document.lineAt(location.end), regionName, regionFormat.end);
                ++regionCount;
            }
        }
    });

    return regionCount;
}

exports.getRegionFormat = async function () {
    if (vscode.workspace.getConfiguration('ALTB').get('UseAlRegions')) {
        const appFileUri = await fileManagement.getAppFile();
        const file = await vscode.workspace.openTextDocument(appFileUri);
        if (file) {
            const json = JSON.parse(file.getText());
            if (json && json.runtime) {
                const runtime = parseInt(json.runtime.charAt(0));
                if (runtime >= 6)
                    return {
                        start: "#region",
                        end: "#endregion",
                    }
            }
        }
    }
    return {
        start: "//#region",
        end: "//#endregion",
    }
}

/**
 * @param {vscode.TextEditorEdit} editBuilder 
 * @param {vscode.TextLine} line 
 * @param {string} name 
 * @param {string} regionText
 */
function addRegionStart(editBuilder, line, name, regionText) {
    const range = line.range;
    const currIndent = line.text.substring(0, line.firstNonWhitespaceCharacterIndex);
    editBuilder.insert(range.start, currIndent + regionText + ' ' + name + '\n');
}
/**
 * @param {vscode.TextEditorEdit} editBuilder 
 * @param {vscode.TextLine} line 
 * @param {string} name  
 * @param {string} regionText
 */
function addRegionEnd(editBuilder, line, name, regionText) {
    const range = line.range;
    const currIndent = line.text.substring(0, line.firstNonWhitespaceCharacterIndex);
    editBuilder.insert(range.end, '\n' + currIndent + regionText + ' ' + name);
}

const EventSubscriberRegex =
    /\[EventSubscriber\(ObjectType::(?<ObjectType>Codeunit|Page|Report|Table|XMLPort), (Codeunit|Page|Report|Database|XMLPort)::(?<Publisher>\w*|"[^"]*"), '(?<Event>([^']|'')*)', '(?<Element>([^']|'')*)', (true|false), (true|false)\)\]/i;
const functionParametersRegex = /\[[^\]]+\]\s*$/;
const functionNameRegex = /\b(trigger|procedure)\b\s+(?<name>\w+|"[^"]*")/i;
/**
 * @param {vscode.TextDocument} document 
 * @param {number} lineNo 
 */
function getRegionNameForAlFunction(document, lineNo) {
    var line = document.lineAt(lineNo).text;
    let match;
    if ((match = EventSubscriberRegex.exec(line)) !== null) {
        //TODO: Change ${match.groups.Publisher} to the corresponding object ID
        return `EventSubscriber ${match.groups.ObjectType} ${match.groups.Publisher} ${match.groups.Event} ${match.groups.Element}`;
    }

    if (functionParametersRegex.test(line) && !functionNameRegex.test(line)) {
        /* The line where the function starts on a line with function parameter without the 'normal' function declaration.
         * e.g.:
         *  [...]
         *  procedure name(...)
         */
        line = document.lineAt(lineNo + 1).text;
    }
    match = functionNameRegex.exec(line);
    if (match === null) {
        console.error('Does not contain a AL function: ' + line.trimLeft());
        vscode.window.showErrorMessage(`Failed to find function name on line ${lineNo} (line number before adding regions): Region will be named "error function name not found" instead`);
        return '"error function name not found"';
    }
    return match.groups['name'];
}