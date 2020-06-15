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
 * @returns {Array<{start: number, end: number, indent: number, kind: string}>} kind = 'kind' match group of startOfCodeBlockRegex
 */
exports.findAllCodeBlocks = function findAllCodeBlocks(text, startOfCodeBlockRegex, increaseRegex, decreaseRegex) {
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
 * 
 * @param {Array<{start: number, end: number, indent: number, kind: string}>} codeBlocks 
 * @param {boolean} checkKind 
 * 
 * @returns {Array<{start: number, end: number, indent: number, kind: string, concatCount: number}>}
 */
exports.concatCodeBlocksNextToEachOther = function concatCodeBlocksNextToEachOther(codeBlocks, checkKind) {
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

/**
 * @param {string} text 
 * @param {{start: number, end: number}} location 
 */
exports.getLineNumbersForLocations = function getLineNumbersForLocations(text, location) {
    let tempString = text.substring(0, location.start);
    const startLineNo = tempString.split(/\n/).length - 1;
    tempString = text.substring(location.start, location.end);
    return {
        start: startLineNo,
        end: startLineNo + tempString.split(/\n/).length - 1
    }
}

const commandRegex = /((?<=\/\/)(?!#(end)?region\b)|(?<=\/\/#(end)?region\b)).*/g;
const stringRegex = /'([^'\n]|'')*'|"[^"\n]+"/g;
/**
 * @param {string} text
 */
exports.removeAllCommentsAndStrings = (text) => {
    let newText = text.replace(commandRegex, '');
    newText = replaceBlockCommentsWithNewlines(newText);
    newText = newText.replace(stringRegex, '""'); // replaced with "" so that function still get recognized e.g.: 'procedure "function b"(...)' -> 'procedure ""()' 
    return newText;
}

const blockCommandRegex = /\/\*([^\*]|\*(?!\/))*\*\//g;
/**
 * @param {string} text
 */
function replaceBlockCommentsWithNewlines(text) {
    if (!blockCommandRegex.global) console.error('blockCommandRegex should have option "global"');
    
    let match;
    let newText = text;
    while((match = blockCommandRegex.exec(newText)) !== null){
        const newlines = match[0].replace(/[^\n]+/g, '');
        newText = newText.substring(0, match.index) + newlines + newText.substring(match.index + match[0].length);
        blockCommandRegex.lastIndex = match.index + newlines.length;
    }

    return newText;
}