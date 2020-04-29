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
    const currentWorkspaceFolderPath = workspaceManagement.getCurrentWorkspaceFolderPath();
    let files = await vscode.workspace.findFiles(`**/${file}`);
    files = files.filter(file => file.fsPath.startsWith(currentWorkspaceFolderPath));

    if (files.length === 0) throw `No ${file} found`;
    if (files.length > 1)
        throw `Multiple ${file} files found:\n`
            + files.map(file => file.path).join(', ');
    return files[0];
}

exports.getAppFile = function getAppFile() {
    return findSingleInstanceFileInCurrentWorkspaceFolder('app.json');
}