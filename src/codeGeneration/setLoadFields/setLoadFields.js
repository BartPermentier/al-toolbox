const vscode = require('vscode');
const genFunc = require('../../generalFunctions');

const lookAheadLineCount = 5;
const findRecRegex = /^\s*\.\s*(Find(First|Last|Set)?|Get)\s*\(/i;
const fieldRegex = /^\s*\.\s*(TestField\(\s*)?(?<field>"[^"\n]*"|\w+\b)(?!\s*(\(|:=))/i;
const setLoadFieldsRegex = /^\s*\.\s*SetLoadFields\s*\(([^)]*)/i;
const ifThenRegex = /^[^(\/\/|\/*)].*then$/i;

/**
 * Adds or modifies SetLoadFields from the record at recordPosition.
 * Field that are used in the current document and are not yet present are added. 
 * Existing fields won't be removed, even if there is no use found.
 * 
 * @param {vscode.TextEditor} textEditor 
 * @param {vscode.Position} recordPosition 
 */
exports.generateSetLoadFields = async function (textEditor, recordPosition) {
    const document = textEditor.document;
    const currentWordRange = document.getWordRangeAtPosition(recordPosition);
    const currentRecName = document.getText(currentWordRange);

    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generate SetLoadFields',
        cancellable: true
    }, async (progress, cancellationToken) => {
        progress.report({ message: `Finding definition for ${currentRecName}...` });
        const definition = await vscode.commands.executeCommand('vscode.executeDefinitionProvider', document.uri, recordPosition);
        if (cancellationToken.isCancellationRequested) return;
        if (definition.length === 0) {
            vscode.window.showErrorMessage(`No definition found for ${currentRecName}`);
            return;
        }
        if (definition.length !== 1) {
            vscode.window.showErrorMessage(`Multiple definitions found for ${currentRecName}`);
            return;
        }
        
        let endOfDefinitionPos;
        if (definition[0].uri.fsPath !== document.uri.fsPath)
            endOfDefinitionPos = currentWordRange.end;
        else
            endOfDefinitionPos = definition[0].range.end;
        
        if (!checkIfIsRecord(endOfDefinitionPos, document)) {
            vscode.window.showErrorMessage(`${currentRecName} is not a Record`);
            return;
        }

        if (!checkIfIsLocalVar(endOfDefinitionPos, document) && !checkIfParameterVar(endOfDefinitionPos, document)) {
            vscode.window.showErrorMessage(`${currentRecName} is not a local Record or parameter`);
            return;
        }    
        
        // Get all used fields and find/get positions
        progress.report({ message: 'Searching for used fields...' });
        const locations = await vscode.commands.executeCommand('vscode.executeReferenceProvider', document.uri, textEditor.selection.start);
        const positions = locations
            .filter(location => location.uri.fsPath === document.uri.fsPath)
            .map(location => location.range.end) 
            .sort();
        if (cancellationToken.isCancellationRequested) return;

        let currentGetOfFindRecPos, currentFields = [], currentSetLoadFields, latestSetLoadFields, match, fieldsAdded;
        let setLoadFieldsAddedOrModified = 0, totalFieldsAdded = 0;

        progress.report({ message: 'Calculating new SetLoadFields...' });
        await textEditor.edit(edit => {
            // Checks for each position if it's followed by a field, Get/Find methode, or SetLoadFields method
            // Then it use this information to add or modify SetLoadFields with the found fields. This only adds fields, so even if no use for a field is found it won't be removed
            positions.forEach(position => {
                const text = document.getText(new vscode.Range(position, position.translate(lookAheadLineCount)));
                if (findRecRegex.test(text)) {
                    if (currentGetOfFindRecPos) {
                        fieldsAdded = addOrModifySetLoadFieldsToEdit(edit, currentGetOfFindRecPos, currentFields, document, currentSetLoadFields, currentRecName);
                        if (fieldsAdded > 0) {
                            ++setLoadFieldsAddedOrModified;
                            totalFieldsAdded += fieldsAdded;
                        }
                    }
                    currentGetOfFindRecPos = position;
                    currentSetLoadFields = latestSetLoadFields;
                    latestSetLoadFields = undefined;
                    currentFields = [];
                }
                else if ((match = fieldRegex.exec(text)) && !currentFields.includes(match[1]))
                    currentFields.push(match.groups.field);
                else if ((match = setLoadFieldsRegex.exec(text))) {
                    latestSetLoadFields = {
                        existingFields: match[1].split(/\s*,\s*/).map(field => field.trim()).filter(field => field !== ''),
                        endPosition: document.positionAt(document.offsetAt(position) + match[0].length)
                    };
                }
            });
            if (currentGetOfFindRecPos) {
                fieldsAdded = addOrModifySetLoadFieldsToEdit(edit, currentGetOfFindRecPos, currentFields, document, currentSetLoadFields, currentRecName);
                if (fieldsAdded > 0) {
                    ++setLoadFieldsAddedOrModified;
                    totalFieldsAdded += fieldsAdded;
                }
            }
        });

        return {
            fieldsAddedCount: totalFieldsAdded,
            setLoadFieldsAddedOrModifiedCount: setLoadFieldsAddedOrModified
        }
    });
}

/**
 * @param {vscode.Position} endOfDefinitionPos 
 * @param {vscode.TextDocument} document 
 */
function checkIfIsRecord(endOfDefinitionPos, document) {
    const text = document.getText(
        new vscode.Range(endOfDefinitionPos, endOfDefinitionPos.translate(lookAheadLineCount))
    );
    const isRecord = /^(\s*,\s*("[^"\n]*"|\w+))*\s*:\s*Record\b/i.test(text);
    return isRecord;
}

/**
 * functionWithVarsRegex finds a function declaration with vars. The text to be matched must end just before the start of a type declaration of a var.
 * e.g.:
 * +---------------------------------------+
 * | ...                                   |
 * | procedure test(): Boolean;            |
 * | var                                   |
 * |     WebResponse: HttpResponseMessage; |
 * |     Loop, I : Integer;                |
 * |     RecordVar$                        |
 * +---------------------------------------+
 * where $ is the end of the string.     
 */
const functionWithVarsRegex = /\b(procedure|trigger)\s+("[^"\n]*"|\w+)\s*\(((var)?\s*((\b\w+\b|"[^"]*")\s*)+:\s*\w+\b[^;]*;?)*\s*\)\s*((\w+|"[^"]*")?\s*:\s*\w+)?(\s*;)?\s+var(\s*((\b\w+\b|"[^"]*")\s*,?\s*)+:\s*\w+\b[^;]*;)*\s*((\b\w+\b|"[^"]*")\s*,?\s*)+\s*$/i;

/**
 * @param {vscode.Position} endOfDefinitionPos 
 * @param {vscode.TextDocument} document 
 */
function checkIfIsLocalVar(endOfDefinitionPos, document) {
    const text = document.getText(new vscode.Range(
        new vscode.Position(0, 0), endOfDefinitionPos
    ));

    return functionWithVarsRegex.test(text);
}

/**
 * functionWithParamsRegex finds a function declaration with parameters.
 * e.g.:
 * +--------------------------------------------------------------------+
 * | ...                                                                |
 * | procedure test(RecordVar$): Boolean;                               |
 * +--------------------------------------------------------------------+
 * where $ is the end of the string.     
 */
 
 const functionWithParamsRegex = /\b(procedure|trigger)\s+("[^"\n]*"|\w+)\s*\(((var)?\s*((\b\w+\b|"[^"]*")\s*)+:\s*\w+\b[^;]*;?)*((var)?\s*((\b\w+\b|"[^"]*")\s*)+)+\s*$/i;

/**
 * @param {vscode.Position} endOfDefinitionPos 
 * @param {vscode.TextDocument} document 
 */
 function checkIfParameterVar(endOfDefinitionPos, document) {
    const text = document.getText(new vscode.Range(
        new vscode.Position(0, 0), endOfDefinitionPos
    ));

    return functionWithParamsRegex.test(text);
}

/**
 * 
 * @param {vscode.TextEditorEdit} edit 
 * @param {vscode.Position} position 
 * @param {Array<string>} fields 
 * @param {vscode.TextDocument} document 
 * @param {{ existingFields: Array<string>, endPosition: vscode.Position }} loadFieldsInfo 
 * @param {string} recName 
 * 
 * @returns number of fields added
 */
function addOrModifySetLoadFieldsToEdit(edit, position, fields, document, loadFieldsInfo, recName) {
    fields = genFunc.removeDuplicates(fields);
        fields = fields.filter((v,i) => fields.indexOf(v) === i && !isSystemFieldOrFunction(v))    
    if (fields.length === 0) return 0;
    const line = document.lineAt(position.line);
    const indent = line.text.substr(0, line.firstNonWhitespaceCharacterIndex);
    if (loadFieldsInfo) {
        fields = fields.filter(field => !loadFieldsInfo.existingFields.includes(field));
        if (fields.length === 0) return 0;
        edit.insert(
            loadFieldsInfo.endPosition,
            `${loadFieldsInfo.existingFields.length === 0 ? '' : ', '}${fields.join(', ')}`);
    } else {
        if(position.line > 1) {
            const prevLine = document.lineAt(position.line - 1);
            if (ifThenRegex.test(prevLine.text.trim())) {
                const prevLineIndent = prevLine.text.substr(0, prevLine.firstNonWhitespaceCharacterIndex);
                const endPrevLine =  new vscode.Position(prevLine.lineNumber, prevLine.text.trimEnd().length);
                const nextLine = document.lineAt(position.line + 1);

                edit.insert(
                    nextLine.range.start,
                    `${prevLineIndent}end;\n`
                );                                  
                
                edit.insert(
                    endPrevLine,
                    ' begin'
                );                              
            }
        }

        edit.insert(
            line.range.start,
            `${indent}${recName}.SetLoadFields(${fields.join(', ')});\n`
        );
    }
    return fields.length;
}

function isSystemFieldOrFunction(field) {
    const systemFieldOrFunctions =  ["RecordId", "SystemId", "SystemCreatedAt","SystemCreatedBy","SystemCreatedAt","SystemModifiedBy", 
        "Ascending", "Count", "CountApprox","CurrentCompany","CurrentKey","IsEmpty","FilterGroup","GetFilters","HasFilter",
        "HasLinks","IsEmpty","IsTemporary","MarkedOnly","SecurityFiltering","TableCaption","TableName","WritePermission"];
        
    return systemFieldOrFunctions.find(key => key.toUpperCase() === field.toUpperCase()) != undefined;
}
