const vscode = require('vscode');
const snippets = require('./snippets');
const generalFunctions = require('../generalFunctions');

const commentRegionRegex = /\/\/(#(end)?region)/g;
const targetLanguageRegex = /\$TargetLanguage/g;
const targetLanguage2Regex = /\$TargetLanguage2/g;

exports.SnippetCompletionItemProvider = class SnippetCompletionItemProvider {
    snippets;
    useAlRegions;
    usePromotedActionProperties;
    snippetTargetLanguage;
    snippetTargetLanguage2;
    snippetPrefixToSnippetString = new Map();

    constructor() {
        this.#getSnippets();
    }

    async #getSnippets() {
        const useAlRegions = await generalFunctions.useAlRegions();
        const usePromotedActionProperties = await generalFunctions.usePromotedActionProperties();
        const snippetTargetLanguage = await generalFunctions.snippetTargetLanguage();
        const snippetTargetLanguage2 = await generalFunctions.snippetTargetLanguage2();
        if (this.useAlRegions !== useAlRegions || this.usePromotedActionProperties || this.snippetTargetLanguage !== snippetTargetLanguage || this.snippetTargetLanguage2 !== snippetTargetLanguage2) {
            this.useAlRegions = useAlRegions;
            this.usePromotedActionProperties = usePromotedActionProperties;
            this.snippetTargetLanguage = snippetTargetLanguage;
            this.snippetTargetLanguage2 = snippetTargetLanguage2;
            this.snippets = [];
            this.#setSnippets(useAlRegions, snippetTargetLanguage, snippetTargetLanguage2);
            this.#setActionSnippet(usePromotedActionProperties);
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

        return item;
    }

    // Private methods
    #setSnippets(useAlRegions, snippetTargetLanguage = 'NLB', snippetTargetLanguage2 = 'FRB') {
        Array.prototype.push.apply(this.snippets, Object.values(snippets.snippets).map(snippet => {
            let snippetString = snippet.body.join('\n');
            if (useAlRegions)
                snippetString = snippetString.replace(commentRegionRegex, '$1');
            if (snippetTargetLanguage2 != '')
                snippetString = snippetString.replace(targetLanguage2Regex, snippetTargetLanguage2);
            if (snippetTargetLanguage != '')
                snippetString = snippetString.replace(targetLanguageRegex, snippetTargetLanguage);
            return this.#createcompletionItem(snippet.prefix, snippet.description, snippetString);
        }));
    }

    #setActionSnippet(usePromotedActionProperties) {
        let snippetsToUse = (usePromotedActionProperties ? snippets.actionSnippetWithPromotedActionProperties : snippets.actionSnippetWithoutPromotedActionProperties);
        Array.prototype.push.apply(this.snippets, Object.values(snippetsToUse).map(snippet => {
            return this.#createcompletionItem(snippet.prefix, snippet.description, snippet.body.join('\n'));
        }));
    }

    #createcompletionItem(prefix, description, contents) {
        const completionItem = new vscode.CompletionItem(prefix);
        completionItem.kind = vscode.CompletionItemKind.Snippet;
        this.snippetPrefixToSnippetString.set(prefix, contents);
        completionItem.insertText = new vscode.SnippetString(contents);
        completionItem.detail = description;
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
    generalFunctions.useAlRegions()
        .then(useAlRegions => {
            let snippetText = snippets.snippets["Snippet: Region"].body.join('\n');
            if (useAlRegions)
                snippetText = snippetText.replace(commentRegionRegex, '$1');
            textEditor.insertSnippet(new vscode.SnippetString(snippetText));
        });
}