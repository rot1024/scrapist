#!/usr/bin/env node
"use strict";

const yargs = require("yargs");

const scrapist = require("..");

const argv = yargs()
  .help()
  .argv;

if (!argv._[0]) {
  yargs.showHelp();
}
