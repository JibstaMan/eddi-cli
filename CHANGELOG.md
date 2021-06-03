# Changelog

## 0.4.0

### Features

* `diff` command to compare differences between EDDI's personality and the local personality.
* `sync` command to easily sync changes made in EDDI with the local personality.
* Support for executing commands inside a personality folder (the one containing `_personality.json`).

### Improvements

* `build` now outputs personality based on `name`, not the folder name.
* Logging now colors the important keywords.

## 0.3.1

### Improvements

* Personality choice now has questions formulated.
* Added alias `-v` for `--version` and `-h` for `--help`
* Added validation to `enabled` and `priority` when changing template setting comments.

### Bug fixes

* Removed priority option from create

## 0.3.0

### Improvements

* Changed the order in which `init` writes files, so when it crashes on personality.json, the other files aren't written yet.

### Bug fixes

* Fixed bug where UTF8 BOM broke JSON.parse, which resulting in `init` not working.

## 0.2.0

### Features

* `create` command to add new templates.
* `reconcile` command, so it's easy to move files around and afterwards automatically update all paths within the personality.
* `init` now supports template setting comments.

### Improvements

* Personality choices.
  * Only include folders containing a personality.
  * Exclude the default personality.
  * Default when only one folder is found.
* Log-level colors.
* Handle case when no personalities could be found specifically.

### Bug fixes

* Fixed a bug where questions were still being asked after explicitly setting the parameter.
* Fixed boolean type questions.
* Batch files should now pause correctly.
* Handle all errors.

## 0.1.0
__Initial release__

* Basic `init` command.
* `build` and `watch` commands.