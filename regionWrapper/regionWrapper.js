const vscode = require('vscode');
// import * as vscode from 'vscode';

const regionStartRegex = /\/\/#region\b/;
const commandRegex = /((?<=\/\/)(?!#(end)?region\b)|(?<=\/\/#(end)?region\b)).*/g;
const stringRegex = /'([^']|'')*'|"[^"]+"/g;

const alFunctionRegex = /(\[[^\]]+\]\s*)?(\blocal\b\s*)?\b(?<kind>trigger|procedure)\b\s+(\w+|"[^"]*")\s*\(/gmi;
const beginRegex = /\bbegin\b|\bcase\b.*\bof\b/gmi;
const endRegex = /\bend;?\b/gi;
/**
 * @param {vscode.TextEditorEdit} editBuilder
 * @param {vscode.TextDocument} document
 */
exports.WrapAllFunctions = (editBuilder, document) => {
    let text = document.getText();
    text = text.replace(commandRegex, '');
    text = text.replace(stringRegex, '""'); // replaced with "" so alFunctionRegex still recognizes function like: 'procedure "function b"(...)'
    
    let alFunctionLocations = findAllCodeBlocks(text, alFunctionRegex, beginRegex, endRegex);
    
    let regionCount = 0;
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

    return regionCount;
}

const DataItemOrColumnRegex = /\b(?<kind>dataitem|column)\b\s*\(/gmi;
/**
 * @param {vscode.TextEditorEdit} editBuilder
 * @param {vscode.TextDocument} document
 * @param {Boolean} skipSingelInstance If skipSingelInstance is true, dataitems or columns that are not followed by another don't get regions
 */
exports.WrapAllDataItemsAndColumns = (editBuilder, document, skipSingelInstance) => {
    let editor = vscode.window.activeTextEditor;
    let text = document.getText();
    text = text.replace(commandRegex, '');
    text = text.replace(stringRegex, '');

    let dataitemAndColumnLocations = findAllCodeBlocks(text, DataItemOrColumnRegex, /\{/g, /\}/g);
    dataitemAndColumnLocations.forEach(location => {
        const lineNos = getLineNumbersForLocations(text, location);
        location.start = lineNos.start;
        location.end = lineNos.end;
    });
    let concatinatedBloks = concatCodeBlocksNextToEachOther(dataitemAndColumnLocations, true);

    let regionCount = 0;
    concatinatedBloks.forEach(location => {
        if (!(skipSingelInstance && location.concatCount === 1)) {
            if ((location.start === 0) ||
                    !regionStartRegex.test(document.lineAt(location.start-1).text)) { // check if line before function does not contain a region
                let regionName = location.kind;
                if (location.concatCount > 1) regionName += 's';
                addRegionStartOrEnd(editBuilder, document.lineAt(location.start), regionName, false);
                addRegionStartOrEnd(editBuilder, document.lineAt(location.end), regionName, true);
                ++regionCount;
            }
        }
    });

    return regionCount;
}


const CodeBlockTokenTypes = {
    STARTOFBLOCK: 0,
    INCREASE: 1,
    DECREASE: 2
}
/**
 * @param {string} text 
 * @param {RegExp} startOfCodeBlockRegex 
 * @param {RegExp} increaseRegex 
 * @param {RegExp} decreaseRegex 
 * 
 * @returns {Array<{start: number, end: number, indent: number, kind: string}>}
 */
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
            type: CodeBlockTokenTypes.STARTOFBLOCK,
            blockKind: match.groups['kind']
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
                    indent: 0,
                    kind: location.blockKind
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
                        block.indent = blocksStack.length;
                        blocks.push(block);
                    }
                }
                break;
        }
    });
    
    return blocks;
}

/**
 * @param {string} text 
 * @param {{start: number, end: number}} location 
 */
function getLineNumbersForLocations(text, location) {
    let tempString = text.substring(0, location.start);
    const startLineNo = tempString.split(/\n/).length - 1;
    tempString = text.substring(location.start, location.end);
    return {
        start: startLineNo,
        end: startLineNo + tempString.split(/\n/).length - 1
    }
}

/**
 * @param {vscode.TextEditorEdit} editBuilder 
 * @param {vscode.TextLine} line 
 * @param {string} name 
 * @param {boolean} isEnd 
 */
function addRegionStartOrEnd(editBuilder, line, name, isEnd) {
    const range = line.range;
    const currIndent = line.text.substring(0, line.firstNonWhitespaceCharacterIndex);
    if (isEnd){
        editBuilder.insert(range.end, '\n' + currIndent + '\/\/#endregion ' + name);
    } else {
        editBuilder.insert(range.start, currIndent + "\/\/#region " + name + '\n');
    }
}

const functionParametersRegex = /\[[^\]]+\]\s*$/;
const functionNameRegex = /\b(trigger|procedure)\b\s+(?<name>\w+|"[^"]*")/i;
/**
 * @param {vscode.TextDocument} document 
 * @param {number} lineNo 
 */
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

/**
 * 
 * @param {Array<{start: number, end: number, indent: number, kind: string}>} codeBlocks 
 * @param {boolean} checkKind 
 * 
 * @returns {Array<{start: number, end: number, indent: number, kind: string, concatCount: number}>}
 */
function concatCodeBlocksNextToEachOther(codeBlocks, checkKind) {
    if (codeBlocks.length === 0) return [];
    codeBlocks = codeBlocks.sort((a, b) => {
        if (a.indent !== b.indent)
            return a.indent - b.indent;
        else
            a.start - b.start;
    })
    let newCodeBlocks = [Object.assign(codeBlocks[0])];
    newCodeBlocks[0].concatCount = 1;
    for(let i = 1; i < codeBlocks.length; i++){
        const nextCodeBlock = Object.assign(codeBlocks[i]);
        if (nextCodeBlock.start === newCodeBlocks[newCodeBlocks.length-1].end + 1 &&
                !(checkKind && newCodeBlocks[newCodeBlocks.length-1].kind !== nextCodeBlock.kind)) {
            newCodeBlocks[newCodeBlocks.length-1].end = nextCodeBlock.end;
            newCodeBlocks[newCodeBlocks.length-1].concatCount++;
        } else {
            nextCodeBlock.concatCount = 1;
            newCodeBlocks.push(nextCodeBlock);
        }
    }

    return newCodeBlocks;
}