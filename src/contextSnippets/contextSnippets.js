const vscode = require('vscode');
const snippets = require('./snippets');
const generalFunctions = require('../generalFunctions');

const commentRegionRegex = /\/\/(#(end)?region)/g;

exports.SnippetCompletionItemProvider = class SnippetCompletionItemProvider {
    snippets;
    useAlRegions;
    snippetPrefixToSnippetString = new Map();
    
    constructor() {
        this.getSnippets();
    }

    async getSnippets() {
        const useAlRegions = await generalFunctions.useAlRegions();
        if (this.useAlRegions !== useAlRegions) {
            this.useAlRegions = useAlRegions;
            this.setSnippets(useAlRegions);
        }
        return this.snippets;
    }

    /**
     * @param {boolean} useAlRegions 
     */
    setSnippets(useAlRegions) {
        this.snippets = Object.values(snippets.snippets).map(snippet => {
            const completionItem = new vscode.CompletionItem(snippet.prefix);
            completionItem.kind = vscode.CompletionItemKind.Snippet;
            let snippetString = snippet.body.join('\n');
            if(useAlRegions)
                snippetString = snippetString.replace(commentRegionRegex, '$1');
            this.snippetPrefixToSnippetString.set(snippet.prefix, snippetString);
            completionItem.insertText = new vscode.SnippetString(snippetString);
            completionItem.detail = snippet.description;
            return completionItem;
        });
    }

    /**
     * @param {vscode.TextDocument} document 
     * @param {vscode.Position} position 
     * @param {vscode.CancellationToken} token 
     * @param {vscode.CompletionContext} context
     */
    provideCompletionItems(document, position, token, context) {
        return this.getSnippets();
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
}

const choiceRegex = /\${\d+\|([^,}]+)[^}]*}/g;
const placeholderRegex = /\${\d+:([^{}]+)}/g;
const tabelstopAndVariableRegex = /\$(\d+|[A-Z_]+)/g;
/**
 * @param {string} snippetString 
 */
function replaceSnippetVarsWithDefault(snippetString) {
    let result = snippetString;
    while(placeholderRegex.test(result)) // placehoders can be recursive
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