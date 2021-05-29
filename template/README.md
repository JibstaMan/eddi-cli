# EDDI CLI project

This project was created with the [EDDI CLI](https://github.com/jibstaman/eddi-cli).

**Disclaimer:** This tool will stop working the moment that EDDI makes significant changes to the data structure within the personality files.

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

This will watch for file changes in the `_personality.json` file and all the files that are references within it. So when you save a template file, it will immediately `build` the entire personality and update the file that EDDI uses.

## Managing files

After running `init`, the CLI will have created a folder for each personality. These folders contain a special file, called `_personality.json`. This file matches the file that EDDI uses, with one exception. The `script` property has been replaced with a path towards the file containing the actual template.

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

You can move files around, as long as you ensure that the `script` path matches the new location of the template file. This also means that you can change the name of the file, without changing anything within EDDI itself.

## Documentation and resources

* [EDDI CLI](https://github.com/jibstaman/eddi-cli)
* [EDDI GitHub](https://github.com/EDCD/EDDI)
* [EDDI variables](https://github.com/EDCD/EDDI/blob/develop/SpeechResponder/Variables.md)
* [EDDI DataDefinitions source (C#)](https://github.com/EDCD/EDDI/tree/develop/DataDefinitions)
* [Cottle templating language](https://cottle.readthedocs.io/en/stable/index.html)