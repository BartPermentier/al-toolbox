exports.snippets = {
	"Snippet: Table with No Series": {
		"prefix": "rtableNoSeries (ALTB)",
		"description": "Snippet: Table with no series Design Pattern",
		"body": [
			"table ${1:id} \"${2:MyTable}\"",
			"{",
			"\tDataClassification = ${4|SystemMetadata,CustomerContent,EndUserIdentifiableInformation|};",
			"\tCaption = '${2:MyTable}';",
			"\t//DrillDownPageId = ;",
			"\t//LookupPageId = ;",
			"\tfields",
			"\t{",
			"\t\tfield(1; \"${3:MyField}\"; Code[20])",
			"\t\t{",
			"\t\t\tCaption = '${3:MyField}';",
			"\t\t\tDataClassification = SystemMetadata;",
			"\t\t\ttrigger OnValidate()",
			"\t\t\tvar",
			"\t\t\t\t${6:SetupName}: Record ${5:SetupRec};",
			"\t\t\t\tNoSeriesManagement: Codeunit NoSeriesManagement;",
			"\t\t\tbegin",
			"\t\t\t\tif \"${3:MyField}\" <> xRec.\"${3:MyField}\" then begin",
			"\t\t\t\t\t${6:SetupName}.Get();",
			"\t\t\t\t\tNoSeriesManagement.TestManual(${6:SetupName}.${7:NoSeriesFieldFromSetupTable});",
			"\t\t\t\t\t\"No. Series\" := '';",
			"\t\t\t\tend;",
			"\t\t\tend;",
			"\t\t}",
			"",
			"\t\tfield(107; \"No. Series\"; Code[20])",
			"\t\t{",
			"\t\t\tCaption = 'No. Series';",
			"\t\t\tTableRelation = \"No. Series\";",
			"\t\t\tDataClassification = SystemMetadata;",
			"\t\t}",
			"\t}",
			"",
			"\tkeys",
			"\t{",
			"\t\tkey(PK;\"${3:MyField}\")",
			"\t\t{",
			"\t\t\tClustered = true;",
			"\t\t}",
			"\t}",
			"",
			"\ttrigger OnInsert()",
			"\tvar",
			"\t\t${6:SetupName}: Record ${5:SetupRec};",
			"\t\tNoSeriesManagement: Codeunit NoSeriesManagement;",
			"\tbegin",
			"\t\tif \"${3:MyField}\" = '' then begin ",
			"\t\t\t${6:SetupName}.Get(); ",
			"\t\t\t${6:SetupName}.Testfield(${7:NoSeriesFieldFromSetupTable});",
			"\t\t\tNoSeriesManagement.InitSeries(${6:SetupName}.${7:NoSeriesFieldFromSetupTable},xRec.\"No. Series\",0D,\"${3:MyField}\",\"No. Series\"); ",
			"\t\tend;",
			"\tend;",
			"}"
		]
	},
	"Snippet: Table Field": {
		"prefix": "rfield (ALTB)",
		"body": [
			"field(${1:id}; \"${2:MyField}\"; ${3:Type})",
			"{",
			"\tCaption = '${2:MyField}', comment = '${4:$TargetLanguage}=\"${5:YourLanguageText}\"';",
			"\tDataClassification = ${6|SystemMetadata,CustomerContent,EndUserIdentifiableInformation|};",
			"}$0"
		],
		"description": "Snippet: Table Field"
	},
	"Snippet: Table Field Code": {
		"prefix": "rfieldcode (ALTB)",
		"body": [
			"field(${1:id}; \"${2:MyField}\"; Code[${3:Length}])",
			"{",
			"\tCaption = '${2:MyField}', comment = '${4:$TargetLanguage}=\"${5:YourLanguageText}\"';",
			"\tTableRelation = ${6:Table.Field};",
			"\tDataClassification = ${7|SystemMetadata,CustomerContent,EndUserIdentifiableInformation|};",
			"}$0"
		],
		"description": "Snippet: Table Field Code with table relation"
	},
	"Snippet: Table Field Option": {
		"prefix": "rfieldoption (ALTB)",
		"body": [
			"field(${1:id}; \"${2:MyField}\"; Option)",
			"{",
			"\tCaption = '${2:MyField}', comment = '${3:$TargetLanguage}=\"${4:YourLanguageText}\"';",
			"\tOptionMembers = ${5};",
			"\tOptionCaption = '${5}';",
			"\tDataClassification = ${6|SystemMetadata,CustomerContent,EndUserIdentifiableInformation|};",
			"}$0"
		],
		"description": "Snippet: Table Field option"
	},
	"Snippet: Function": {
		"description": "Snippet Function with handled Design Pattern",
		"prefix": "rfunction (ALTB)",
		"body": [
			"//#region ${1:MethodName}",
			"local procedure Do${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName}; Handled: Boolean)",
			"begin",
			"\tif Handled then exit;",
			"\t$0",
			"end;",
			"",
			"//#region MainFunction And Publishers",
			"internal procedure ${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName})",
			"var",
			"\tHandled: Boolean;",
			"begin",
			"\tOnBefore${1:MethodName}(${4:v}, Handled);",
			"",
			"\tDo${1:MethodName}(${4:v}, Handled);",
			"",
			"\tOnAfter${1:MethodName}(${4:v});",
			"end;",
			"",
			"[IntegrationEvent(false, false)]",
			"local procedure OnBefore${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName}; var Handled : Boolean)",
			"begin",
			"end;",
			"",
			"[IntegrationEvent(false, false)]",
			"local procedure OnAfter${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName})",
			"begin",
			"end;",
			"//#endregion MainFunction And Publishers",
			"//#endregion ${1:MethodName}"
		]
	},
	"Snippet: Function With Confirmation": {
		"description": "Snippet Function with handled Design Pattern and Confirmation",
		"prefix": "rfunctionConfirm (ALTB)",
		"body": [
			"//#region ${1:MethodName}",
			"local procedure Do${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName}; Handled: Boolean)",
			"begin",
			"\tif Handled then exit;",
			"\t$0",
			"end;",
			"",
			"//#region MainFunction, Confirmation And Publishers",
			"internal procedure ${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName})",
			"var",
			"\tHandled: Boolean;",
			"begin",
			"\tif not Confirm${1:MethodName}(${4:v}) then exit;",
			"",
			"\tOnBefore${1:MethodName}(${4:v}, Handled);",
			"",
			"\tDo${1:MethodName}(${4:v}, Handled);",
			"",
			"\tOnAfter${1:MethodName}(${4:v});",
			"end;",
			"",
			"local procedure Confirm${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName}): Boolean",
			"var",
			"\tLbl${1:MethodName}: Label '${5:Are you sure?}';",
			"begin",
			"\tif not GuiAllowed or ${4:v}.GetHideValidationDialog() then exit(true);",
			"\texit(Confirm(Lbl${1:MethodName}));",
			"end;",
			"",
			"[IntegrationEvent(false, false)]",
			"local procedure OnBefore${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName}; var Handled : Boolean)",
			"begin",
			"end;",
			"",
			"[IntegrationEvent(false, false)]",
			"local procedure OnAfter${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName})",
			"begin",
			"end;",
			"//#endregion MainFunction And Publishers",
			"//#endregion ${1:MethodName}"
		]
	},
	"Snippet: HideValidation": {
		"description": "Snippet Hide Validation Dialog Design Pattern on Table (ALTB)",
		"prefix": "rHideValidation (ALTB)",
		"body": [
			"//#region SetHideValidationDialog",
			"procedure SetHideValidationDialog(HideDialog: Boolean)",
			"begin",
			"\tHideValidationDialog := HideDialog;",
			"end;",
			"//#endregion SetHideValidationDialog",
			"",
			"//#region GetHideValidationDialog",
			"procedure GetHideValidationDialog():Boolean",
			"begin",
			"\texit(HideValidationDialog);",
			"end;",
			"//#endregion GetHideValidationDialog",
			"var",
			"\tHideValidationDialog: Boolean"
		]
	},
	"Snippet: SimpleFunction": {
		"description": "Snippet Simple Function without publishers",
		"prefix": "rSimpleFunction (ALTB)",
		"body": [
			"//#region ${1:MethodName}",
			"local procedure ${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName})",
			"begin",
			"\t$0",
			"end;",
			"//#endregion ${1:MethodName}"
		]
	},
	"Snippet: SimplestFunction": {
		"description": "Snippet Procedure without parameters",
		"prefix": "rSimplestFunction (ALTB)",
		"body": [
			"//#region ${1:MyProcedure}",
			"${2|local,internal|} procedure ${1:MyProcedure}($3)",
			"begin",
			"\t$0",
			"end;",
			"//#endregion ${1:MyProcedure}"
		]
	},
	"Snippet: Upgrade Function (Company)": {
		"description": "Upgrade Function (Company)",
		"prefix": "rUpgradeFunctionCompany (ALTB)",
		"body": [
			"#region Upgrade${1:FeatureName}",
			"internal procedure Upgrade${1:FeatureName}()",
			"var",
			"\tUpgradeTag: Codeunit \"Upgrade Tag\";",
			"begin",
			"\tif UpgradeTag.HasUpgradeTag(Return${1:FeatureName}UpgradeTag()) then",
			"\t\texit;",
			"",
			"\t// Move below code to 'RegisterPerCompanyTags' (Codeunit::\"Upgrade Tag\" - OnGetPerCompanyUpgradeTags())",
			"\t// PerCompanyUpgradeTags.Add(Return${1:FeatureName}UpgradeTag());",
			"",
			"\t// Move below code to 'OnUpgradePerCompany'",
			"\t// Upgrade${1:FeatureName}();",
			"",
			"\t$0",
			"",
			"\tUpgradeTag.SetUpgradeTag(Return${1:FeatureName}UpgradeTag());",
			"end;",
			"",
			"#region Return${1:FeatureName}UpgradeTag",
			"internal procedure Return${1:FeatureName}UpgradeTag(): Text[250]",
			"begin",
			"\texit('${2:Prefix-ID}-${1}-$CURRENT_YEAR$CURRENT_MONTH$CURRENT_DATE');",
			"end;",
			"#endregion Return${1:FeatureName}UpgradeTag   ",
			"#endregion Upgrade${1:FeatureName}"
		]
	},
	"Snippet: Upgrade Function (Database)": {
		"description": "Upgrade Function (Database)",
		"prefix": "rUpgradeFunctionDatabase (ALTB)",
		"body": [
			"#region Upgrade${1:FeatureName}",
			"internal procedure Upgrade${1:FeatureName}()",
			"var",
			"\tUpgradeTag: Codeunit \"Upgrade Tag\";",
			"begin",
			"\tif UpgradeTag.HasUpgradeTag(Return${1:FeatureName}UpgradeTag()) then",
			"\t\texit;",
			"",
			"\t// Move this code to 'RegisterPerDatabaseTags' (Codeunit::\"Upgrade Tag\" - OnGetPerDatabaseUpgradeTags())",
			"\t// PerDatabaseUpgradeTags.Add(Return${1:FeatureName}UpgradeTag());",
			"",
			"\t// Move this code to 'OnUpgradePerDatabase'",
			"\t// Upgrade${1:FeatureName}();",
			"",
			"\t$0",
			"",
			"\tUpgradeTag.SetUpgradeTag(Return${1:FeatureName}UpgradeTag());",
			"end;",
			"",
			"#region Return${1:FeatureName}UpgradeTag",
			"internal procedure Return${1:FeatureName}UpgradeTag(): Text[250]",
			"begin",
			"\texit('${2:Prefix-ID}-${1}-$CURRENT_YEAR$CURRENT_MONTH$CURRENT_DATE');",
			"end;",
			"#endregion Return${1:FeatureName}UpgradeTag   ",
			"#endregion Upgrade${1:FeatureName}"
		]
	},
	"Snippet: InstallCodeunit": {
		"description": "Snippet to Create an Install Codeunit",
		"prefix": "rInstalCodeunit (ALTB)",
		"body": [
			"codeunit ${1:ID} \"${2:Name}\"",
			"{",
			"\tSubtype=Install;",
			"",
			"\ttrigger OnInstallAppPerCompany()",
			"\tbegin",
			"\t\t//Code for company related operations",
			"\t\t$0",
			"\tend;",
			"",
			"\ttrigger OnInstallAppPerDatabase()",
			"\tbegin",
			"\t\t// Code for database related operations",
			"\tend;",
			"}"
		]
	},
	"Snippet: Subscriber to a Table": {
		"description": "Create a Subscriber to a table",
		"prefix": "rSubscribeTable (ALTB)",
		"body": [
			"//#region EventSubscriber Table ${2:Object No.} ${3|OnBeforeInsertEvent,OnBeforeModifyEvent,OnBeforeDeleteEvent,OnBeforeRenameEvent,OnBeforeValidateEvent,OnAfterInsertEvent,OnAfterModifyEvent,OnAfterDeleteEvent,OnAfterRenameEvent,OnAfterValidateEvent|} ${4:TriggerFieldOrActionName}",
			"[EventSubscriber(ObjectType::Table, Database::${6:RecName}, '${3:Trigger}', '${4:TriggerFieldOrActionName}', true, true)]",
			"local procedure ${3:Trigger}${4:TriggerFieldOrActionName}_T${2:Object No.}(var Rec: Record ${6:RecName}; var xRec: Record ${6:RecName}; CurrFieldNo: Integer)",
			"begin",
			"\t$0",
			"end;",
			"//#endregion EventSubscriber Table ${2:Object No.} ${3:Trigger} ${4:TriggerFieldOrActionName}"
		]
	},
	"Snippet: Subsriber to a Codeunit": {
		"description": "Create a Subscriber to a codeunit",
		"prefix": "rSubscribeCodeunit (ALTB)",
		"body": [
			"//#region EventSubscriber Codeunit ${1:Object No.} ${3:Trigger}",
			"[EventSubscriber(ObjectType::Codeunit, Codeunit::${2:CodeunitName}, '${3:Trigger}', '', true, true)]",
			"local procedure ${3:Trigger}_C${1:Object No.}(var Rec: Record ${4:RecName})",
			"begin",
			"\t$0",
			"end;",
			"//#endregion EventSubscriber Codeunit ${1:Object No.} ${3:Trigger}"
		]
	},
	"Snippet: Subsriber to a Page": {
		"description": "Create a Subscriber to a page",
		"prefix": "rSubscribePage (ALTB)",
		"body": [
			"//#region EventSubscriber Page ${1:Object No.} ${2|OnAfterActionEvent,OnAfterGetCurrRecordEvent,OnAfterGetRecordEvent,OnAfterValidateEvent,OnBeforeActionEvent,OnBeforeValidateEvent,OnClosePageEvent,OnDeleteRecordEvent,OnInsertRecordEvent,OnModifyRecordEvent,OnNewRecordEvent,OnOpenPageEvent,OnQueryClosePageEvent|}",
			"[EventSubscriber(ObjectType::Page, Page::${3:PageName}, '${2:Trigger}', '${4:CtrlSpace}', true, true)]",
			"local procedure ${2:Trigger}_P${1:Object No.}(var Rec: Record ${5:RecName});",
			"begin",
			"\t$0",
			"end;",
			"//#endregion EventSubscriber Page ${1:Object No.} ${2:Trigger}"
		]
	},
	"Snippet: Field Page": {
		"description": "Add a field to a page",
		"prefix": "rFieldPage (ALTB)",
		"body": [
			"field(${1})",
			"{",
			"\tApplicationArea = All;",
			"}",
			"$0"
		]
	},
	"Snippet: Calcforuma": {
		"description": "Snippet Tags for calcformula property in a table",
		"prefix": "rCalcFormula (ALTB)",
		"body": [
			"CalcFormula = ${1|count,lookup,sum,exist,average,max,min|} (${2:TablePointField} where (${3:DestinationField}= ${4|field,filter,const|} (${5:SourceFieldOrFilter})));",
			"Editable = false;$0"
		]
	},
	"Snippet: SubPagePart": {
		"description": "Snippet To Create a SubPage Part in a Page",
		"prefix": "rSubPagePart (ALTB)",
		"body": [
			"part(${1:PartName};\"${2:LinkedTableName}\")",
			"{",
			"\tCaption = '${1:PartName}';",
			"\tSubPageLink = \"${3:SubPageFieldName}\" = field(\"${4:ThisPageFieldName}\");",
			"}"

		]
	},
	"Snippet: Tooltip": {
		"description": "Snippet Tooltip",
		"prefix": "rTooltip (ALTB)",
		"body": [
			"ToolTip = '$1';"
		]
	},
	"Snippet: Function2": {
		"description": "Snippet Function 2 Parameters",
		"prefix": "rfunction2 (ALTB)",
		"body": [
			"//#region ${1:MethodName}",
			"local procedure Do${1:MethodName}(var ${4:Rec}: ${2:ObjectType} ${3:ObjectName}; var ${7:xRec}: ${5:ObjectType} ${6:ObjectName}; Handled: Boolean)",
			"begin",
			"\tif Handled then exit;",
			"\t$0",
			"end;",
			"",
			"//#region MainFunction And Publishers",
			"internal procedure ${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName}; var ${7:xRec}: ${5:ObjectType} ${6:ObjectName})",
			"var",
			"\tHandled: Boolean;",
			"begin",
			"\tOnBefore${1:MethodName}(${4:v}, ${7:xRec}, Handled);",
			"",
			"\tDo${1:MethodName}(${4:v}, ${7:xRec}, Handled);",
			"",
			"\tOnAfter${1:MethodName}(${4:v}, ${7:xRec});",
			"end;",
			"",
			"[IntegrationEvent(false, false)]",
			"local procedure OnBefore${1:MethodName}(var ${4:Rec}: ${2:ObjectType} ${3:ObjectName}; var ${7:xRec}: ${5:ObjectType} ${6:ObjectName}; var Handled : Boolean)",
			"begin",
			"end;",
			"",
			"[IntegrationEvent(false, false)]",
			"local procedure OnAfter${1:MethodName}(var ${4:Rec}: ${2:ObjectType} ${3:ObjectName}; var ${7:xRec}: ${5:ObjectType} ${6:ObjectName})",
			"begin",
			"end;",
			"//#endregion MainFunction And Publishers",
			"//#endregion ${1:MethodName}"
		]
	},
	"Snippet: Function3": {
		"description": "Snippet Function 3 Parameters",
		"prefix": "rfunction3 (ALTB)",
		"body": [
			"//#region ${1:MethodName}",
			"local procedure Do${1:MethodName}(var ${4:Rec}: ${2:ObjectType} ${3:ObjectName}; var ${7:xRec}: ${5:ObjectType} ${6:ObjectName}; var ${10:VarName3}: ${8:ObjectType} ${9:ObjectName}; Handled: Boolean)",
			"begin",
			"\tif Handled then exit;",
			"\t$0",
			"end;",
			"",
			"//#region Main Function And Publishers",
			"internal procedure ${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName}; var ${7:xRec}: ${5:ObjectType} ${6:ObjectName}; var ${10:VarName3}: ${8:ObjectType} ${9:ObjectName})",
			"var",
			"\tHandled: Boolean;",
			"begin",
			"\tOnBefore${1:MethodName}(${4:v}, ${7:xRec}, ${10:VarName3}, Handled);",
			"",
			"\tDo${1:MethodName}(${4:v}, ${7:xRec}, ${10:VarName3}, Handled);",
			"",
			"\tOnAfter${1:MethodName}(${4:v}, ${7:xRec}, ${10:VarName3});",
			"end;",
			"",
			"[IntegrationEvent(false, false)]",
			"local procedure OnBefore${1:MethodName}(var ${4:Rec}: ${2:ObjectType} ${3:ObjectName}; var ${7:xRec}: ${5:ObjectType} ${6:ObjectName}; var ${10:VarName3}: ${8:ObjectType} ${9:ObjectName}; var Handled : Boolean)",
			"begin",
			"end;",
			"",
			"[IntegrationEvent(false, false)]",
			"local procedure OnAfter${1:MethodName}(var ${4:Rec}: ${2:ObjectType} ${3:ObjectName}; var ${7:xRec}: ${5:ObjectType} ${6:ObjectName}; var ${10:VarName3}: ${8:ObjectType} ${9:ObjectName})",
			"\tbegin",
			"\tend;",
			"//#endregion MainFunction And Publishers",
			"//#endregion ${1:MethodName}"
		]
	},
	"Snippet: Test Function": {
		"description": "Snippet Test Function",
		"prefix": "rTestFunction (ALTB)",
		"body": [
			"#//region Test${1:MethodName}",
			"[Test]",
			"procedure Test${1:MethodName}()",
			"var",
			"\t",
			"begin",
			"\t// [SCENARIO] ${2:Scenario Description}",
			"\tInitialize();",
			"",
			"\t// [GIVEN] ${3:Given}",
			"\t${0}",
			"\t// [WHEN] ${4:When}",
			"",
			"\t// [THEN] ${5:Then}",
			"",
			"end;",
			"//#endregion Test${1:MethodName}"
		],
	},
	"Snippet: Test Codeunit": {
		"prefix": "rtestcodeunit (ALTB)",
		"body": [
			"codeunit ${1:Id} \"${2:Feature} Tests\"",
			"{",
			"\t// [FEATURE] ${2:Feature}",
			"\tSubtype = Test;",
			"",
			"\t$0",
			"",
			"\t#region Initialize",
			"\tlocal procedure Initialize()",
			"\tbegin",
			"\t\tLibraryTestInitialize.OnTestInitialize(Codeunit::\"${2:Feature} Tests\");",
			"",
			"\t\tClearLastError();",
			"\t\tLibraryVariableStorage.Clear();",
			"\t\tLibrarySetupStorage.Restore();",
			"\t\tif IsInitialized then",
			"\t\t\texit;",
			"",
			"\t\tLibraryTestInitialize.OnBeforeTestSuiteInitialize(Codeunit::\"${2:Feature} Tests\");",
			"",
			"\t\tLibraryRandom.Init();",
			"",
			"\t\t// Prepare setup tables etc. that are used for all test functions",
			"",
			"\t\tIsInitialized := true;",
			"\t\tCommit();",
			"",
			"\t\t// Add all setup tables that are changed by tests to the SetupStorage, so they can be restored for each test function that calls Initialize.",
			"\t\t// This is done InMemory, so it could be run after the COMMIT above",
			"\t\t// LibrarySetupStorage.Save(Database::\"[SETUP TABLE ID]\");",
			"",
			"\t\tLibraryTestInitialize.OnAfterTestSuiteInitialize(Codeunit::\"${2:Feature} Tests\");",
			"\tend;",
			"\t#endregion Initialize",
			"",
			"\tvar",
			"\t\tAssert: Codeunit Assert;",
			"\t\tLibraryRandom: Codeunit \"Library - Random\";",
			"\t\tLibrarySetupStorage: Codeunit \"Library - Setup Storage\";",
			"\t\tLibraryTestInitialize: Codeunit \"Library - Test Initialize\";",
			"\t\tLibraryVariableStorage: Codeunit \"Library - Variable Storage\";",
			"\t\tIsInitialized: Boolean;",
			"}"
		],
		"description": "Test Codeunit"
	},
	"Snippet: Region": {
		"description": "Snippet to create region",
		"prefix": "rregion (ALTB)",
		"body": [
			"//#region ${1:MethodName}",
			"$TM_SELECTED_TEXT$0",
			"//#endregion ${1:MethodName}"
		]
	},
	"Snippet: Summary": {
		"description": "Snippet Summary",
		"prefix": "rSummary (ALTB)",
		"body": [
			"///<summary>${1:summary}</summary>"
		]
	},
	"Snippet: Table Method": {
		"description": "Snippet to create a Method on a table",
		"prefix": "rTableMethod (ALTB)",
		"body": [
			"//#region ${1:MethodName}",
			"procedure ${1:MethodName}(var ${4:v}: ${2:ObjectType} ${3:ObjectName})",
			"var",
			"\t${6:MgtCodeunitName}: Codeunit ${5:MgtCodeunitObjectName};",
			"begin",
			"\t${6:MgtCodeunitName}.${7:ThisObjectsName}_${1:MethodName}(Rec, ${4:v});",
			"end;",
			"//#endregion ${1:MethodName}"
		]
	},
	"Snippet: MyNotification Design Pattern": {
		"description": "Snippet to add your Notification to MyNotifications",
		"prefix": "rMyNotifications (ALTB)",
		"body": [
			"//#region MyNotifications",
			"//#region EventSubscriber Page 1518 OnInitializingNotificationWithDefaultState",
			"[EventSubscriber(ObjectType::Page, Page::\"My Notifications\", 'OnInitializingNotificationWithDefaultState', '', true, true)]",
			"local procedure OnInitializingNotificationWithDefaultState_P1518()",
			"var",
			"\tMyNotifications: Record \"My Notifications\";",
			"\t${1:NotificationName}: Label '${2:X happens}';",
			"\t${3:NotificationDescription}: Label '${4:Show a notification when X happens}';",
			"begin",
			"\tMyNotifications.InsertDefaultWithTableNum(${5:ReturnNotificationIdFunction},",
			"\t\t${1:NotificationName},",
			"\t\t${3:NotificationDescription},",
			"\t\tDatabase::${6:TableToFilterOn});",
			"end;",
			"//#endregion EventSubscriber Page 1518 OnInitializingNotificationWithDefaultState",
			"",
			"//#region ${5:ReturnNotificationIdFunction}",
			"local procedure ${5:ReturnNotificationIdFunction}(): Guid;",
			"begin",
			"\texit('${7:GenerateGuidHere}');",
			"end;",
			"//#endregion ${5:ReturnNotificationIdFunction}",
			"//#endregion MyNotifications"
		]
	},
	"Snippet: EnumToInt": {
		"description": "Snippet to convert an Enum to an Integer",
		"prefix": "rEnumToInt (ALTB)",
		"body": [
			"Evaluate(${1:IntegerVariable}, Format(${2:EnumVariable}, 0, 9));"
		]
	},
	"Record Repeat": {
		"prefix": "rRepeat (ALTB)",
		"body": [
			"if ${1:Rec}.FindSet() then",
			"\trepeat",
			"\t\t$0",
			"\tuntil ${1:Rec}.Next() = 0;"
		]
	},
	"Action Properties": {
		"prefix": "rPropertiesAction (ALTB)",
		"body": [
			"Caption = '${1:Caption}', comment = '${2:$TargetLanguage}=\"${3:YourLanguageCaption}\"';",
			"Promoted = true;",
			"PromotedCategory = ${4|Process,New,Report|};",
			"PromotedIsBig = true;",
			"Image = ${5:Image};$0"

		]
	},
	"Snippet: ActionRef": {
		"prefix": "ractionRef (ALTB)",
		"body": [
			"actionref(${1/[^0-9^a-z]//gi}_Promoted; ${1:ActionName})",
			"{",
			"}"
		],
		"description": "Promoted ActionRef"
	},
	"Snippet: DelChr": {
		"prefix": "rDelChr (ALTB)",
		"body": [
			"DelChr(${1:VarName}, '=', DelChr(${1:VarName}, '=', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'));"
		],
		"description": "Delete all special characters."
	},
	"Snippet: TableExtension": {
		"prefix": "rTableExtension (ALTB)",
		"body": [
			"tableextension ${1:Id} \"${3:ExtensionName}\" extends \"${2:TableName}\" //${4:OriginalId}",
			"{",
			"\tfields",
			"\t{",
			"\t\t$0",
			"\t}",
			"}"
		],
		"description": "Create New TableExtension"
	},
	"Snippet: PageExtension": {
		"prefix": "rPageExtension (ALTB)",
		"body": [
			"pageextension ${1:Id} \"${3:ExtensionName}\" extends \"${2:PageName}\" //${4:OriginalId}",
			"{",
			"\tlayout",
			"\t{",
			"\t\t$0",
			"\t}",
			"",
			"\tactions",
			"\t{",
			"\t}",
			"}"
		],
		"description": "Create New PageExtension"
	},
	"GetEnumName": {
		"prefix": "rGetEnumName (ALTB)",
		"body": [
			"${1:TextVar} := ${2:EnumVar}.Names.Get(${2:EnumVar}.Ordinals.IndexOf(${2:EnumVar}.AsInteger()));"
		],
		"description": "Get Enum Name"
	},
	"ConvertOrdinalToEnum": {
		"prefix": "rConvertOrdinalToEnum (ALTB)",
		"body": [
			"${1:EnumVar} := Enum::\"${2:EnumName}\".FromInteger(${3:OrdinalValue});"
		],
		"description": "Convert Ordinal to Enum"
	},
	"ConvertTextToEnum": {
		"prefix": "rConvertTextToEnum (ALTB)",
		"body": [
			"${1:EnumVar} := Enum::\"${2:EnumName}\".FromInteger(${1:EnumVar}.Ordinals.Get(${1:EnumVar}.Names.IndexOf(${3:EnumTextVar})));"
		],
		"description": "Convert Text to Enum"
	},
	"NLBComment": {
		"prefix": "rNLBComment (ALTB)",
		"body": [
			", comment = '$TargetLanguage=\"${1:$TargetLanguage Text}\"';",
		],
		"description": "Add comment ($TargetLanguage)"
	},
	"FRBComment": {
		"prefix": "rFRBComment (ALTB)",
		"body": [
			", comment = '$TargetLanguage2=\"${1:$TargetLanguage2 Text}\"';",
		],
		"description": "Add comment"
	},
	"NLFRBComment": {
		"prefix": "rNLFRBComment (ALTB)",
		"body": [
			", comment = '$TargetLanguage=\"${1:$TargetLanguage Text}\",$TargetLanguage2=\"${2:$TargetLanguage2 Text}\"';",
		],
		"description": "Add comment"
	}
}

exports.actionSnippetWithPromotedActionProperties = {
	"Snippet: Action": {
		"prefix": "rAction (ALTB)",
		"body": [
			"action(${1:ActionName})",
			"{",
			"\tApplicationArea = ${2|All,Basic,Suite,Advanced|};",
			"\tCaption = '${3:Caption}', comment = '${4:$TargetLanguage}=\"${5:YourLanguageCaption}\"';",
			"\tPromoted = true;",
			"\tPromotedCategory = ${6|Process,New,Report|};",
			"\tPromotedIsBig = true;",
			"\tImage = ${7:Image};",
			"",
			"\ttrigger OnAction()",
			"\tbegin",
			"\t\t$0",
			"\tend;",
			"}"
		]
	},
}

exports.actionSnippetWithoutPromotedActionProperties = {
	"Snippet: Action": {
		"prefix": "rAction (ALTB)",
		"body": [
			"action(${1:ActionName})",
			"{",
			"\tApplicationArea = ${2|All,Basic,Suite,Advanced|};",
			"\tCaption = '${3:Caption}', comment = '${4:$TargetLanguage}=\"${5:YourLanguageCaption}\"';",
			"\tImage = ${6:Image};",
			"",
			"\ttrigger OnAction()",
			"\tbegin",
			"\t\t$0",
			"\tend;",
			"}"
		]
	},
}