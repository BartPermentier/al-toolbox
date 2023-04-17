
const extension = require('./extension');
const TelemetryReporter = require('vscode-extension-telemetry');
const constants = require('./constants');
const generalFunctions = require('./generalFunctions');

function initializeTelemetryReporter(context) {
    if (!constants.AppInsightsKey)
        return;
    extension.telemetryReporter = new TelemetryReporter.default(context.extension.id, context.extension.packageJSON.version, constants.AppInsightsKey);
}

async function sendEvent(eventName, properties, measurements) {
    if(!extension.telemetryReporter)     
        return;    
    const appInsightIdentifier = await generalFunctions.telemetryIdentifier();
    properties.identifier = appInsightIdentifier;
    extension.telemetryReporter.sendTelemetryEvent(eventName, properties, measurements);    
}

function sendExtensionActivatedEvent() { sendEvent('001-ExtensionActivated'); }
function sendRenumberAllEvent() { sendEvent('002-RenumberAll'); }
function sendRenumberFieldsEvent() { sendEvent('003-RenumberFields'); }
function sendRenumberAllFieldsEvent() { sendEvent('004-RenumberAllFields'); }
function sendCreateRelatedTablesEvent() { sendEvent('005-CreateRelatedTables'); }
function sendOpenRelatedTablesEvent() { sendEvent('006-OpenRelatedTables'); }
function sendOpenRelatedPagesEvent() { sendEvent('007-OpenRelatedPages'); }
function sendOpenRelatedTablesAndPagesEvent() { sendEvent('008-OpenRelatedTablesAndPages'); }
function sendCopyFieldsToRelatedTablesEvent() { sendEvent('009-copyFieldsToRelatedTables'); }
function sendWrapAllFunctionsEvent() { sendEvent('010-wrapAllFunctions'); }
function sendWrapAllDataItemsAndColumnsEvent() { sendEvent('011-WrapAllDataItemsAndColumns'); }
function sendWrapAllEvent() { sendEvent('012-WrapAll'); }
function sendAddRegionEvent() { sendEvent('013-AddRegion'); }
function sendChangePrefixEvent() { sendEvent('014-ChangePrefix'); }
function sendInitGitignoreEvent() { sendEvent('015-InitGitignore'); }
function sendGenerateSetLoadFieldsEvent() { sendEvent('016-GenerateSetLoadFields'); }
function sendAPIEntityWarningsEvent() { sendEvent('017-SendAPIEntityWarnings'); }
function sendTranslationFormatEvent() { sendEvent('018-TranslationFormat'); }
function sendFixAA0008Event() { sendEvent('019-FixAA0008Event') }
function sendFixAA0139Event() { sendEvent('020-FixAA0139Event') }
function sendFixAA0666Event() { sendEvent('021-FixAA0666Event') }
function sendPragmaEvent() { sendEvent('022-Pragma') }
function sendPragmaAllEvent() { sendEvent('023-PragmaAll') }
function sendPragmaWithTodoEvent() { sendEvent('024-PragmaWithTodo') }
function sendCustomFoldingEvent() { sendEvent('025-CustomFolding') }
function sendUseSnippetsEvent() { sendEvent('026-UseSnippets') }
function sendUseRegionColorEvent() { sendEvent('027-RegionColor') }
function sendUseRegionTextColorEvent() { sendEvent('028-RegionTextColor') }
function sendSnippetUsageEvent(prefix) { 
    sendEvent(`029-SnippetUsage`, { 'snippet': prefix }) 
} 

module.exports = {
	initializeTelemetryReporter,
    sendExtensionActivatedEvent,
	sendRenumberAllEvent,
    sendRenumberFieldsEvent,
    sendRenumberAllFieldsEvent,
    sendCreateRelatedTablesEvent,
    sendOpenRelatedTablesEvent,
    sendOpenRelatedPagesEvent,
    sendOpenRelatedTablesAndPagesEvent,
    sendCopyFieldsToRelatedTablesEvent,
    sendWrapAllFunctionsEvent,
    sendWrapAllDataItemsAndColumnsEvent,
    sendWrapAllEvent,
    sendAddRegionEvent,
    sendChangePrefixEvent,
    sendInitGitignoreEvent,
    sendGenerateSetLoadFieldsEvent,
    sendAPIEntityWarningsEvent,
    sendTranslationFormatEvent,
    sendFixAA0008Event,
    sendFixAA0139Event,
    sendFixAA0666Event,
    sendPragmaEvent,
    sendPragmaAllEvent,
    sendPragmaWithTodoEvent,
    sendCustomFoldingEvent,
    sendUseSnippetsEvent,
    sendUseRegionColorEvent,
    sendUseRegionTextColorEvent,
    sendSnippetUsageEvent
}
