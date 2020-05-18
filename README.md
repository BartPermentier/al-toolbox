# AL Toolbox for Visual Studio Code

Please visit https://www.altoolbox.com/ for more in depth information and AL Language tips and tricks.

## Features

The AL Toolbox extension adds the region functionality to the Microsoft AL language for Business Central.

The extension also adds some usefull snippets with this region functionality and some Design Pattern Snippets.

![Simple Example](resources/SimpleExample.gif)

## Inspiration

This extension has been inspired by the GitHub user RafaelKoch with his post https://github.com/Microsoft/AL/issues/1007 to implement regions into the AL language. I've been using the suggestion of anzwdev to manually add it to the al extension every month. I got tired of it so I created this extension to do it automatically.

## Commands [NEW]

- ALTB: Start Project: Create Related Tables | This function will create Tableextensions for Sales Header/Line, Purchase Header/Line and Contact + their Pageextensions.
- ALTB: Create regions for all AL functions and triggers | Running this command will generate Regions around all Functions that don't have regions yet.
- ALTB: Create regions for all AL dataitems and columns | Running this command will generate Regions around all Dataitems and Columns in a report.
- ALTB: Create regions for all AL functions, triggers, dataitems, and columns | Combination of the previous 2.
- ALTB: Renumber AL Objects | This function will renumber your objects based on the number ranges in the App.json
- ALTB: Change Object Prefix | This function will ask you what the new prefix should be and rename all your objects andd the settings.json.
- ALTB: Open Related Tables/Pages | This function will open the related tables/pages for the object you are working on, so you can easily copy paste fields between the related tables of Sales Header for example.


## Settings

This extension contributes no settings yet.

## Known Issues

- ALTB: Renumber AL Objects: This function will currently not renumber extension objects. Next release will fix this.

## Before After
![BeforeAfter](resources/BeforeAfter.png)

## Contributers

Kasper De Smedt: Great work on the commands that generate regions automatically! I wouldn't have been able to do it myself!
