const vscode = require('vscode');
const snippets = require('./snippets');
const generalFunctions = require('../generalFunctions');
const telemetry = require('../telemetry');

const commentRegionRegex = /\/\/(#(end)?region)/g;
const targetLanguageRegex = /\$TargetLanguage/g;
const targetLanguage2Regex = /\$TargetLanguage2/g;

exports.SnippetCompletionItemProvider = class SnippetCompletionItemProvider {
    snippets;
    useAlRegions;
    usePromotedActionProperties;    
    snippetTargetLanguage;
    snippetTargetLanguage2;    
    useSimpleFunctionSnippets;
    snippetPrefixToSnippetString = new Map();

    constructor() {
        this.#getSnippets();
    }

    async #getSnippets() {
        const useAlRegions = await generalFunctions.useAlRegions();
        const usePromotedActionProperties = await generalFunctions.usePromotedActionProperties();
        const snippetTargetLanguage = generalFunctions.snippetTargetLanguage();
        const snippetTargetLanguage2 = generalFunctions.snippetTargetLanguage2();
        const useSimpleFunctionSnippets = generalFunctions.useSimpleFunctionSnippets();
        if (this.useAlRegions !== useAlRegions || this.usePromotedActionProperties || this.snippetTargetLanguage !== snippetTargetLanguage || this.snippetTargetLanguage2 !== snippetTargetLanguage2 || this.useSimpleFunctionSnippets !== useSimpleFunctionSnippets) {
            this.useAlRegions = useAlRegions;
            this.usePromotedActionProperties = usePromotedActionProperties;
            this.snippetTargetLanguage = snippetTargetLanguage;
            this.snippetTargetLanguage2 = snippetTargetLanguage2;
            this.snippets = [];
            this.#setSnippets(useAlRegions, snippetTargetLanguage, snippetTargetLanguage2, usePromotedActionProperties, useSimpleFunctionSnippets);
        }
        return this.snippets;
    }

    /**
     * @param {vscode.TextDocument} document 
     * @param {vscode.Position} position 
     * @param {vscode.CancellationToken} token 
     * @param {vscode.CompletionContext} context
     */
    provideCompletionItems(document, position, token, context) {
        return this.#getSnippets();
    }

    /**
     * @param {vscode.CompletionItem} item 
     * @param {vscode.CancellationToken} token 
     */
    resolveCompletionItem(item, token) {
        let snippetString = this.snippetPrefixToSnippetString.get(item.label);
        item.documentation = new vscode.MarkdownString(
            "```\n" +
            replaceSnippetVarsWithDefault(snippetString) +
            "\n```", true);
        console.log(item);
        return item;
    }



    // Private methods
    #setSnippets(useAlRegions, snippetTargetLanguage = 'NLB', snippetTargetLanguage2 = 'FRB', usePromotedActionProperties, useSimpleFunctionSnippets) {
        // Action snippets
        Array.prototype.push.apply(this.snippets, Object.values(usePromotedActionProperties ? snippets.actionSnippetWithPromotedActionProperties : snippets.actionSnippetWithoutPromotedActionProperties).map(snippet => {
            return this.#createcompletionItem(snippet.prefix, snippet.description, this.#replaceParams(snippet.body.join('\n'), useAlRegions, snippetTargetLanguage, snippetTargetLanguage2));
        }));

        // Function snippets
        Array.prototype.push.apply(this.snippets, Object.values(useSimpleFunctionSnippets ? snippets.simpleFunctionSnippets : snippets.functionSnippetsWithObjectType).map(snippet => {
            return this.#createcompletionItem(snippet.prefix, snippet.description, this.#replaceParams(snippet.body.join('\n'), useAlRegions, snippetTargetLanguage, snippetTargetLanguage2));
        }));

        // Other Snippets
        Array.prototype.push.apply(this.snippets, Object.values(snippets.snippets).map(snippet => {
            return this.#createcompletionItem(snippet.prefix, snippet.description, this.#replaceParams(snippet.body.join('\n'), useAlRegions, snippetTargetLanguage, snippetTargetLanguage2));
        }));
    }

    #replaceParams(textToReplace, useAlRegions, language1, language2, ) {
        if(useAlRegions)
        textToReplace = textToReplace.replace(commentRegionRegex, '$1');
        if (language1 !== "")
            textToReplace = textToReplace.replace(targetLanguageRegex, language1);         
        if (language2 !== "")
            textToReplace = textToReplace.replace(targetLanguage2Regex, language2);

        return textToReplace;
    }

    #createcompletionItem(prefix, description, contents) {
        const completionItem = new vscode.CompletionItem(prefix);
        completionItem.kind = vscode.CompletionItemKind.Snippet;
        this.snippetPrefixToSnippetString.set(prefix, contents);
        completionItem.insertText = new vscode.SnippetString(contents);
        completionItem.detail = description;
        completionItem.command = {
            title: '',
            command: 'LogSnippetUsage',
            arguments: [prefix]
        };
        return completionItem;
    }
}

const choiceRegex = /\${\d+\|([^,}]+)[^}]*}/g;
const placeholderRegex = /\${\d+:([^{}]+)}/g;
const tabelstopAndVariableRegex = /\$(\d+|[A-Z_]+)/g;
/**
 * @param {string} snippetString 
 */
function replaceSnippetVarsWithDefault(snippetString) {
    let result = snippetString;
    while (placeholderRegex.test(result)) // placehoders can be recursive
        result = result.replace(placeholderRegex, '$1');
    result = result
        .replace(choiceRegex, '$1')
        .replace(tabelstopAndVariableRegex, '');

    return result;
}

/**
 * @param {vscode.TextEditor} textEditor 
 */
exports.addRegion = function (textEditor) {
    telemetry.sendAddRegionEvent();
    generalFunctions.useAlRegions()
        .then(useAlRegions => {
            let snippetText = snippets.snippets["Snippet: Region"].body.join('\n');
            if (useAlRegions)
                snippetText = snippetText.replace(commentRegionRegex, '$1');
            textEditor.insertSnippet(new vscode.SnippetString(snippetText));
        });
}