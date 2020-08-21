# AL Toolbox for Visual Studio Code

Please visit https://www.altoolbox.com/ for more in depth information and AL Language tips and tricks.

## Features

The AL Toolbox extension adds the region functionality to the Microsoft AL language for Business Central.

The extension also adds some usefull snippets with this region functionality and some Design Pattern Snippets.

![Simple Example](resources/SimpleExample.gif)

## Inspiration

This extension has been inspired by the GitHub user RafaelKoch with his post https://github.com/Microsoft/AL/issues/1007 to implement regions into the AL language. I've been using the suggestion of anzwdev to manually add it to the al extension every month. I got tired of it so I created this extension to do it automatically.

## Commands

- ALTB: Start Project: Create Related Tables | This function will create Tableextensions for Sales Header/Line, Purchase Header/Line and Contact + their Pageextensions.

- ALTB: Create regions for all AL functions and triggers | Running this command will generate Regions around all Functions that don't have regions yet.

- ALTB: Create regions for all AL dataitems and columns | Running this command will generate Regions around all Dataitems and Columns in a report.

- ALTB: Create regions for all AL functions, triggers, dataitems, and columns | Combination of the previous 2.

- ALTB: Renumber AL Objects | This function will renumber your objects based on the number ranges in the App.json
    - Objects will be numbered in ascending order stating with the lowest number in first available range. The ranges are taken from idRange(s) in the app.json file.
    - Extension objects will be added to the 80,000-89,999 range if 80,000 is in the available ranges. If not the same is done as for the other objects.

- ALTB: Change Object Prefix | This function will ask you what the new prefix should be and rename all your objects and the settings.json.

- ALTB: Open Related Tables/Pages | This function will open the related tables/pages for the object you are working on, so you can easily copy paste fields between the related tables of Sales Header for example.

- ALTB: Copy fields to related tables | This will copy al fields from the current table to all related tables. If there are conflicts you will get a popup that allows you to navigate to them:

    ![Popup](resources/CopyFieldConflictPopup.png)
- ALTB: init .gitignore | Creates the following .gitignore in the current workspace folder or appends the missing lines to the existing .gitignore
```
# ALTB
.alpackages/
.alcache/
rad.json
*.app
```

## Settings

- ALTB.UseOldFileNamingConventions | Boolean: default `true`
    - Use `<ObjectPrefix>(<ExtenedObjectId>-Ext)?<ObjectId>.<ObjectNameExcludingPrefix>.al` instead of `<ObjectNameExcludingPrefix>.<FullTypeName>(Ext)?.al` for file names.

- ALTB.PutCreatedRelatedObjectsInSeparateFolders | Boolean: default `false`
    - If false all objects created with 'ALTB: Start Project: Create Related Tables' are put in there respective object folder. If true each group of related objects is put in a subfolder of that object folder.

- ALTB.AdditionalRelatedObjects | List: default `[]`
    - Adds additional related pages and tables. These are used while navigating and creating related tables.
    Note that this only works for PageExtensions and TableExtensions, not your own Pages and Tables.
    A more indepth explanation can be found in the 'Related Objects' section below.

- ALTB.DisableAPIEntityWarnings | Boolean: default `false`
    - Disables error messages for duplicate EntityName and/or EntitySetName from API pages that have the same APIPublisher, APIGroup, and APIVersion

## Known Issues

- ALTB: Renumber AL Objects
  - Extension objects will be added to the 80,000-89,999 range if 80,000 is in the available ranges.
  So if only the range 80,000-80,100 is in the ranges objects will still get ids greater than 80,100.
  - If there exist one or more extension objects of the same type where the last 4 digits of the ids are the same,
  then they will receive the same id. e.g.: extension objects with id 36 and 2,000,036 will both receive 80,036 as id.
  - Extension objects will not be renumbered if they don't have a original object number after there definition and 80,000 is in the available ranges.
  Format example: `pageextension 80021 "EXTCustomerCard" extends "Customer Card" //21`

- ALTB: Change Object Prefix
    - This will only change the prefix of object names and fields.
    So not from actions, events subscribers, parts on pages, keys... 

## Before After
![BeforeAfter](resources/BeforeAfter.png)

## Related Objects

To add additional related objects use the ALTB.AdditionalRelatedObjects setting.

Example format:
```
[
    {  // For adding tableextensions
        folder: 'SalesHeader', // subfolder of src where to place the objects when using "ALTB: Start Project: Create Related Tables"
        objectType: this.AlObjectTypes.tableExtension,
        objects: [ // these tables wil be considered related
            { id: 36, name: 'Sales Header' },
            { id: 110, name: 'Sales Shipment Header' },
            { id: 112, name: 'Sales Invoice Header' },
            { id: 114, name: 'Sales Cr.Memo Header' },
            { id: 5107, name: 'Sales Header Archive' },
            { id: 6660, name: 'Return Receipt Header' }
        ]
    },
    ...
    {  // For adding pageextensions
        table: 'Contact',  // source table of pageextension
        folder: 'Contact',   // subfolder of src where to place the objects when using "ALTB: Start Project: Create Related Tables"
        objectType: this.AlObjectTypes.pageExtension,
        objects: [  // pages for the source table
            { id: 5050, name: 'Contact Card' },
            { id: 5052, name: 'Contact List' }
        ]
    },
    ...
]
```
The default related objects can be found in [src/constants.js](https://github.com/BartPermentier/al-toolbox/blob/master/src/constants.js) in the AL-toolbox repository (search for RelatedObjects).

## Contributers

Kasper De Smedt: Great work on the commands that generate regions automatically! I wouldn't have been able to do it myself!
