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

exports.getAppFile = async function getAppFile(){
    const appFiles = await vscode.workspace.findFiles('**/app.json');
    if (appFiles.length === 0) throw "No app.json found";
    if (appFiles.length > 1)
        throw "Multiple app.json files found:\n"
            + appFiles.map(appFile => appFile.path).join(', ') + '\n'
            + 'This is probably because there are multiple folders in the current workspace.';
    return appFiles[0];
}