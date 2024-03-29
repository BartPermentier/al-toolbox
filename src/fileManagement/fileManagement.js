const workspaceManagement = require('./workspaceManagement');
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");

//#region File Creation
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
exports.writeTextFileAsync = writeTextFileAsync;
function existsFileAsync(filename) {
    return new Promise(resolve => {
        fs.exists(filename, exists => {
            resolve(exists);
        });
    });
}
exports.existsFileAsync = existsFileAsync;
//#endregion

//#region Folder Creation
function createFolder(dir) {
    if (fs.existsSync(dir)) return;
    if (!fs.existsSync(path.dirname(dir))) {
        this.makeDirSync(path.dirname(dir));
    }
    fs.mkdirSync(dir);
}
exports.createFolder = createFolder;
//#endregion

async function findSingleInstanceFileInCurrentWorkspaceFolder(file) {
    const currentWorkspaceFolder = vscode.workspace.getWorkspaceFolder(workspaceManagement.getCurrentWorkspaceFolderUri())
    const relativePattern = new vscode.RelativePattern(currentWorkspaceFolder, `**/${file}`);
    const files = await vscode.workspace.findFiles(relativePattern);

    if (files.length === 0) throw `No ${file} found`;
    if (files.length > 1)
        throw `Multiple ${file} files found:\n`
            + files.map(file => file.path).join(', ');
    return files[0];
}

exports.getAppFile = function getAppFile() {
    return findSingleInstanceFileInCurrentWorkspaceFolder('app.json');
}

exports.getAppFileContents = async function () {
    const appFileUri = await findSingleInstanceFileInCurrentWorkspaceFolder('app.json');
    const file = await vscode.workspace.openTextDocument(appFileUri);
    if(file)
        return JSON.parse(file.getText());
}

exports.getSettingsFile = function getSettingsFile() {
    return findSingleInstanceFileInCurrentWorkspaceFolder('.vscode/settings.json');
}

/**
 * Renames all matches of 'regex' with 'replacement' + match group suffix. e.g.: /(TEST) (?<suffix>suff)/ => 'replacement'suff
 * @param {vscode.TextDocument} textDocument
 * @param {RegExp} regex RegExp that matches the word to rename
 * @param {RegExp} toReplaceRegex RegExp that matches the part of the word that needs to change to replacement
 * @param {string} replacement
 */
exports.renameAll = async function renameAll(textDocument, regex, toReplaceRegex, replacement) {
    if (!regex.global) throw `Regex /${regex.source}/ is not global`;
    let text = textDocument.getText();
    const editResults = [];
    let match;
    while((match = regex.exec(text)) !== null) {
        editResults.push(
            await vscode.commands.executeCommand(
                'vscode.executeDocumentRenameProvider',
                textDocument.uri,
                textDocument.positionAt(match.index),
                match[0].replace(toReplaceRegex, replacement)
            ).then(
                textEdit => vscode.workspace.applyEdit(textEdit)
            ));
        text = textDocument.getText();
    }
    return Promise.all(editResults);
}

exports.renameAllWithoutQuotes = async function renameAllWithoutQuotes(textDocument, regex, toReplaceRegex, replacement) {
    if (!regex.global) throw `Regex /${regex.source}/ is not global`;
    let text = textDocument.getText();
    const editResults = [];
    let match;
    while((match = regex.exec(text)) !== null) {
        console.log(match[0]);
        editResults.push(
            await vscode.commands.executeCommand(
                'vscode.executeDocumentRenameProvider',
                textDocument.uri,
                textDocument.positionAt(match.index),
                match[0].replace(/['"]+/g, '').replace(toReplaceRegex, replacement)
            ).then(
                textEdit => vscode.workspace.applyEdit(textEdit)
            ));
        text = textDocument.getText();
    }
    return Promise.all(editResults);
}

exports.replaceAll = async function replaceAll(textDocument, regex, replacement) {
    if (!regex.global) throw `Regex /${regex.source}/ is not global`;
    let text = textDocument.getText();
    const textEdits = [];
    let match;
    while((match = regex.exec(text)) !== null) {
        const edit = new vscode.TextEdit(
            new vscode.Range(
                textDocument.positionAt(match.index),
                textDocument.positionAt(match.index + match[0].length)
            ),
            replacement);
        textEdits.push(edit);
    }
    return applyEditAndSave(textDocument, textEdits);
}

/**
 * @param {vscode.TextDocument} textDocument 
 * @param {vscode.TextEdit[]} textEdits 
 */
async function applyEditAndSave(textDocument, textEdits) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.set(textDocument.uri, textEdits);
    return vscode.workspace.applyEdit(workspaceEdit)
        .then(async result => {
            if (result) await textDocument.save();
            return result;
        });
}
exports.applyEditAndSave = applyEditAndSave;

/**
 * Gets the position of the matched text as vscode.Range
 * @param {RegExpExecArray} match
 */
exports.getMatchRange = function getMatchRange(match) {
    const textLinesBeforeMatch = match.input.substring(0, match.index).split(/\n/g);
    let lineNo = textLinesBeforeMatch.length - 1;
    let charNo = textLinesBeforeMatch[textLinesBeforeMatch.length - 1].length;
    const matchStartPos = new vscode.Position(lineNo, charNo);

    const textLinesInMatch = match.input.substring(match.index, match.index + match[0].length).split(/\n/g);
    lineNo += textLinesInMatch.length - 1;
    if(textLinesInMatch.length === 1) {
        // is on same line as matchStartPos
        charNo += textLinesInMatch[0].length;
    } else {
        charNo = textLinesInMatch[textLinesInMatch.length - 1].length;
    }
    const matchEndPos = new vscode.Position(lineNo, charNo);
    
    return new vscode.Range(matchStartPos, matchEndPos);
}