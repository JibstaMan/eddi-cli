# EDDI CLI project

This project was created with the [EDDI CLI](https://github.com/jibstaman/eddi-cli).

**Disclaimer:** This tool will stop working the moment that EDDI makes significant changes to the data structure within the personality files.

## Table of content
* [Usage](#usage)
  * [Project initialization](#project-initialization)
  * [Building a personality](#building-a-personality)
  * [Watch for changes to a personality](#watch-for-changes-to-a-personality)
  * [Adding a template to a personality](#adding-a-template-to-a-personality)
  * [Restructuring the templates](#restructuring-the-templates)
  * [Renaming a template](#renaming-a-template)
* [Stopping a terminal process](#stopping-a-terminal-process)
* [Documentation and resources](#documentation-and-resources)

## Usage

The CLI includes `--help` option to get information about its usage.

To keep things simple for you, all the commands will ask you questions when you don't specify them beforehand. You can of course include the information as parameters to the command to skip those questions.

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

This will watch for file changes in the (local) `_personality.json` file and all the files that are references within it. So when you save a template file, it will immediately `build` the entire personality and update the file that EDDI uses.

### Adding a template to a personality

```
npx eddi-cli create
```

After specifying all the information needed, this command will automatically create the file and add it to the `_personality.json`.

### Checking whether it's safe to build

Sometimes it can be helpful to know whether there are any differences between the EDDI personality and the local one. You can do this with:

```
npx eddi-cli diff
```

To explain how `diff` works in more detail, let's look at an example. Since `diff` checks when a file was modified, we'll consider the following sequence of events:
1. You changed "FSD engaged" locally.
2. You're experimenting with "Body scanned" and made some changes to it in EDDI.
3. You changed "Body mapped" locally.

`diff` will indicate:
1. Template "FSD engaged" is different. The ***EDDI*** version was modified more recently.
2. Template "Body scanned" is different. The EDDI version was modified more recently.
3. Template "Body mapped" is different. The local version was modified more recently.

Since you changed the EDDI personality after changing "FSD engaged", the entire EDDI personality file was "modified more recently". This does **not** mean that you specifically edited "FSD engaged" inside EDDI, just that you made **any** changes in EDDI after the local change.

### Synchronize changes from EDDI to local

The option to synchronize was added to make quick experimentation within EDDI a valid use-case. You can then safely synchronize the changes you made in EDDI with the local personality. Predictably, the command is:

```
npx eddi-cli sync
```

Once you understand how `diff` works, you also understand how `sync` works.

`sync` makes no assumptions, you get full control over which changes to synchronize. It will take all the differences and ask you what you want to do with each of them.

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
    "script": "./AFMU repairs.cottle", <-- path to the file containing actual script
    "defaultValue": "<default>",
    "default": true
  },
```

## Stopping a terminal process

If you run a command in a standard terminal, you can stop the process by pressing Ctrl+C. You can do this while being asked a question. Or in the case of `watch`, you can do it at any time.

## Documentation and resources

* [EDDI CLI](https://github.com/jibstaman/eddi-cli#readme)
* [EDDI GitHub](https://github.com/EDCD/EDDI)
* [EDDI variables](https://github.com/EDCD/EDDI/blob/develop/SpeechResponder/Variables.md)
* [EDDI DataDefinitions source (C#)](https://github.com/EDCD/EDDI/tree/develop/DataDefinitions)
* [Cottle templating language](https://cottle.readthedocs.io/en/stable/index.html)