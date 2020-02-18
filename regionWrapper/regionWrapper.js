const vscode = require('vscode');
// import * as vscode from 'vscode';

const alFunctionRegex = /(\[[^\]]+\]\s*)?(\blocal\b\s*)?\b(trigger|procedure)\b\s+(?<name>\w+|"[^"]*")\s*\(/gmi;
const functionParametersRegex = /\[[^\]]+\]\s*$/;
const functionNameRegex = /\b(trigger|procedure)\b\s+(?<name>\w+|"[^"]*")/i;
const regionStartRegex = /\/\/#region\b/;
const commandRegex = /((?<=\/\/)(?!#(end)?region\b)|(?<=\/\/#(end)?region\b)).*/g;
const stringRegex = /'([^']|'')*'|"[^"]+"/g;
const beginRegex = /\bbegin\b|\bcase\b.*\bof\b/gmi;
const endRegex = /\bend;?\b/gi;

exports.WrapAllFunctions = () => {
    let editor = vscode.window.activeTextEditor;
    let document = editor.document;
    let text = document.getText();
    text = text.replace(commandRegex, '');
    text = text.replace(stringRegex, '""'); // replaced with "" so alFunctionRegex still recognizes function like: 'procedure "function b"(...)'
    
    let alFunctionLocations = findAllCodeBlocks(text, alFunctionRegex, beginRegex, endRegex);
    
    let regionCount = 0;
    editor.edit(editBuilder => {
        alFunctionLocations.forEach(location => {
            const lineNos = getLineNumbersForLocations(text, location);
            if ((lineNos.start === 0) ||
                    !regionStartRegex.test(document.lineAt(lineNos.start-1).text)) { // check if line before function does not contain a region
                const regionName = getAlFunctionName(document, lineNos.start);
                addRegionStartOrEnd(editBuilder, document.lineAt(lineNos.start), regionName, false);
                addRegionStartOrEnd(editBuilder, document.lineAt(lineNos.end), regionName, true);
                ++regionCount;
            }
        });
    });

    return regionCount;
}

const CodeBlockTokenTypes = {
    STARTOFBLOCK: 0,
    INCREASE: 1,
    DECREASE: 2
}
function findAllCodeBlocks(text, startOfCodeBlockRegex, increaseRegex, decreaseRegex) {
    if (!startOfCodeBlockRegex.global) console.error('startOfCodeBlockRegex should have option "global"');
    if (!increaseRegex.global) console.error('increaseRegex should have option "global"');
    if (!decreaseRegex.global) console.error('decreaseRegex should have option "global"');
    
    let locations = [];
    let match;
    startOfCodeBlockRegex.lastIndex = 0;
    while((match = startOfCodeBlockRegex.exec(text)) != null){
        locations.push({
            index: match.index,
            type: CodeBlockTokenTypes.STARTOFBLOCK
        });
    }
    increaseRegex.lastIndex = 0;
    while((match = increaseRegex.exec(text)) != null){
        locations.push({
            index: match.index,
            type: CodeBlockTokenTypes.INCREASE
        });
    }
    decreaseRegex.lastIndex = 0;
    while((match = decreaseRegex.exec(text)) != null){
        locations.push({
            index: match.index,
            type: CodeBlockTokenTypes.DECREASE
        });
    }

    locations = locations.sort((a, b) => a.index - b.index);

    let blocks = [];
    let blocksStack = [];
    locations.forEach(location => {
        switch(location.type){
            case CodeBlockTokenTypes.STARTOFBLOCK:
                blocksStack.push({
                    start: location.index,
                    end: -1,
                    indent: 0
                })
                break;
            case CodeBlockTokenTypes.INCREASE:
                if (blocksStack.length > 0)
                    blocksStack[blocksStack.length-1].indent++;
                break;
            case CodeBlockTokenTypes.DECREASE:
                if (blocksStack.length > 0) {
                    const currIndent = --blocksStack[blocksStack.length-1].indent;
                    if (currIndent <= 0) {
                        let block = blocksStack.pop();
                        block.end = location.index;
                        blocks.push(block);
                    }
                }
                break;
        }
    });
    
    return blocks;
}

function getLineNumbersForLocations(text, location) {
    let tempString = text.substring(0, location.start);
    const startLineNo = tempString.split(/\n/).length - 1;
    tempString = text.substring(location.start, location.end);
    return {
        start: startLineNo,
        end: startLineNo + tempString.split(/\n/).length - 1
    }
}

function addRegionStartOrEnd(editBuilder, line, name, isEnd) {
    const range = line.range;
    const currIndent = line.text.substring(0, line.firstNonWhitespaceCharacterIndex);
    if (isEnd){
        editBuilder.insert(range.end, '\n' + currIndent + '\/\/#endregion ' + name);
    } else {
        editBuilder.insert(range.start, currIndent + "\/\/#region " + name + '\n');
    }
}

function getAlFunctionName(document, lineNo) {
    var line = document.lineAt(lineNo).text;
    if (functionParametersRegex.test(line) && !functionNameRegex.test(line)) {
        // The line where the function starts on a line with function parameter without the 'normal' function declaration.
        // e.g.:
        //  [...]
        //  procedure name(...)
        line = document.lineAt(lineNo + 1).text;
    }
    const match = functionNameRegex.exec(line);
    if (match === null)
        console.error('Does not contain a AL function: ' + line);
    return match.groups['name'];
}
