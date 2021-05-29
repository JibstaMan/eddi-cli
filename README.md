# EDDI CLI

A command-line interface to help work with [EDDI](https://github.com/EDCD/EDDI) text-to-speech templates.

**Disclaimer:** This tool will stop working the moment that EDDI makes significant changes to the data structure within the personality files.

## Table of content
* [Why](#why)
* [What](#what)
* [How](#how)
  * [npm vs npx](#npm-vs-npx)
  * [Project initialization](#project-initialization)
  * [Building a personality](#building-a-personality)
  * [Watch for changes to a personality](#watch-for-changes-to-a-personality)
* [Terminal help](#terminal-help)

## Why

Working outside of the EDDI interface has a number of benefits:
* Use your preferred editor.
* View files side-by-side
* Use [Git](https://git-scm.com/) to experiment with more confidence
  * Use branches while experimenting with new things, knowing working version is still easily accessible.

## What
 
EDDI CLI is a command-line interface written in `NodeJS` and usable through `npx`.
* Install [NodeJS](https://nodejs.org/en/) v14+ (`npm`/`npx` comes included).

CLI means that it doesn't come with a graphical user interface. Instead, you need a terminal to interact with the program.

Read [Terminal help](#terminal-help) below for some of the basics on how to use terminals.

## How

The CLI includes `--help` option to get information about its usage.

To keep things simple for you, all the commands will ask you questions when you don't specify them beforehand. You can of course include the information as parameters to the command to skip those questions.

### npm vs npx

`npx` allows you to use the CLI without explicitly installing it. You can also install it using:

```
npm install -g eddi-cli
```

Once installed, you can use the `eddi-cli` command without using `npx ` prefix. The examples below include the `npx ` prefix, so they're completely standalone.

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

## Terminal help

The easiest way to open a terminal on Windows is to navigate to the folder, click the "File" menu and click "Open Windows PowerShell". This will open the terminal in the correct folder and you can start typing commands immediately.

You can also open a terminal and manually navigate to the folder from the terminal. In case you're unfamiliar:

* Search for `cmd` to open the Command Prompt
* Once opened, the path before the `>` indicates the active folder.
* To change drives, you can just type `D:` to navigate to the `D:\` drive.
* To change folder, type in `cd <folder>`, use tab to auto-complete. If your folder has spaces, it can help to use `cd "<folder>"`. You can navigate multiple folders at once, just add a `\` and type in the next folder.