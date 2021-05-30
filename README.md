# EDDI CLI

[![npm](https://badgen.net/npm/v/eddi-cli)](https://www.npmjs.com/package/eddi-cli)
[![license](https://badgen.net/npm/license/eddi-cli)](https://github.com/JibstaMan/eddi-cli/blob/main/LICENSE)

A command-line interface to help work with [EDDI](https://github.com/EDCD/EDDI) text-to-speech templates.

**Disclaimer:** This tool will stop working the moment that EDDI makes significant changes to the data structure within the personality files.

## Table of content
* [Why](#why)
  * [Trade-offs](#trade-offs)
* [What](#what)
* [How](#how)
  * [Project initialization](#project-initialization)
  * [Building a personality](#building-a-personality)
  * [Watch for changes to a personality](#watch-for-changes-to-a-personality)
  * [Adding a template to a personality](#adding-a-template-to-a-personality)
  * [Restructuring the templates](#restructuring-the-templates)
  * [Renaming a template](#renaming-a-template)
* [Terminal help](#terminal-help)
* [npx vs npm](#npx-vs-npm)

## Why

Working outside of the EDDI interface has a number of benefits:
* Use your preferred editor.
* View files side-by-side.
* Create your own folder structure to make finding files a lot easier.
* Use [Git](https://git-scm.com/) to experiment with more confidence
  * Use branches while experimenting with new things, knowing working version is still easily accessible.
  * Open-source your templates by pushing your templates to [GitHub](https://github.com).

### Trade-offs

Developers like to use the term "single source of truth". When you start using EDDI CLI, the files created by EDDI CLI are the new one-and-only location for you to work with EDDI scripts. Changes made in EDDI itself will be overwritten by the EDDI CLI. So when you do make changes in EDDI, make sure to copy them to the respective files too or they will get lost.

## What
 
EDDI CLI is a command-line interface written in `NodeJS` and usable through `npx`.
* Install [NodeJS](https://nodejs.org/en/) v14+ (`npm`/`npx` comes included).

CLI means that it doesn't come with a graphical user interface. Instead, you need a terminal to interact with the program.

Read [Terminal help](#terminal-help) below for some of the basics on how to use terminals. The `init` command will ask whether it should create `.bat` files, so you can use all other commands using Windows Explorer and double-clicking on files.

## How

The CLI includes `--help` option to get information about its usage. You can also ask help for individual commands to get more information about the options for that specific command.

To keep things simple for you, all commands can be run without any parameters. Information needed that isn't specified as parameters will simply be asked of you in the form of questions. When you do provide parameters, the corresponding questions will be skipped.

### Project initialization

Choose the folder where you want your EDDI personalities to end up. Open a terminal inside this folder. Run:

```
npx eddi-cli init
```

This will create a folder for each personality that exists in EDDI. Each of these folders will have a `_personality.json` file, which serves as the entry-point for the `build` and `watch` commands. This file has references to all the template files. You can move or rename template files, as long as you also update the reference in `_personality.json`.

### Building a personality

To update EDDI with the current state of your local files, you can run:

```
npx eddi-cli build
```

This will overwrite the personality file within the EDDI folder, meaning it will see all the changes you've made since the last build.

### Watch for changes to a personality

It's easy to forget to run the `build` command and waste time testing old templates. To solve this, run:

```
npx eddi-cli watch
```

This will watch for file changes in the `_personality.json` file and all the files that are references within it. So when you save a template file, it will immediately `build` the entire personality and update the file that EDDI uses.

### Adding a template to a personality

```
npx eddi-cli create
```

After specifying all the information needed, this command will automatically create the file and add it to the `_personality.json`.

### Restructuring the templates

One of the benefits of using EDDI CLI is that you can structure your project whichever way you prefer. We recognize that you'd likely prefer to just use Windows Explorer to move files around and not use a CLI for this. That's why we chose to create the `reconcile` command.

```
npx eddi-cli reconcile
```

**Note: `reconcile` can't find renamed files. It's only capable of locating files moved deeper into the personality folder.**

Once you've created the folder structure you want, you can run the `reconcile` command and the CLI will figure out where you moved all the files to. So now you don't have to worry about painstakingly updating the `_personality.json` to ensure it can still find all the files you moved!

### Renaming a template

We're under the impression that renaming a template file is not something that happens very often. That's why we've decided not to include this feature. You can rename a file yourself, as long as you also update the file name in the corresponding `script` path inside the `_personality.json`.

```
"scripts": {
  "AFMU repairs": {
    "name": "AFMU repairs",
    "description": "Triggered when repairing modules using the Auto Field Maintenance Unit (AFMU)",
    "enabled": true,
    "priority": 3,
    "responder": true,
    "script": ".\\AFMU repairs.cottle", <-- path to the file containing actual script
    "defaultValue": "<default>",
    "default": true
  },
```

## Terminal help

The easiest way to open a terminal on Windows is to navigate to the folder, click the "File" menu and click "Open Windows PowerShell". This will open the terminal in the correct folder and you can start typing commands immediately.

You can also open a terminal and manually navigate to the folder from the terminal. In case you're unfamiliar:

* Search for `cmd` to open the Command Prompt
* Once opened, the path before the `>` indicates the active folder.
* To change drives, you can just type `D:` to navigate to the `D:\` drive.
* To change folder, type in `cd <folder>` (without the `<` and `>`), use tab to auto-complete. If your folder has spaces, it can help to use `cd "<folder>"`. You can navigate multiple folders at once, just add a `\` and type in the next folder.

## npx vs npm

The reason EDDI CLI is recommending `npx` is for convenience. You don't need to install anything, as long as you're in the correct folder, the commands will work.

`npx` will get the latest version of `eddi-cli` every time, which takes about 5 seconds of time. This delay applies every time you run a command using `npx`. The benefit is that you don't have to worry about which version of `eddi-cli` is installed.

You can install `eddi-cli` globally:

```
npm install -g eddi-cli
```

This will install the latest version at that time, but you won't get new updates automatically. You will have to re-run that command to update. You shave off 5 seconds of every command, but you're responsible for staying up-to-date. You can quickly compare the installed version to the latest version using:

```
npm list -g eddi-cli
npm show eddi-cli version
```

After globally installing `eddi-cli`, you can use all the commands without the `npx ` prefix.
