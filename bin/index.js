#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const Scrapist = require("../cheerio-httpcli").Scrapist;

const argv = yargs
  .usage("scrapist [options]")
  .config("scheme", "scheme js file", configPath => {
    return { schemeData: require(path.resolve(process.cwd(), configPath)) };
  })
  .alias("scheme", "s")
  .demand("scheme")
  .config("config", "config js/json file", configPath => {
    return { configData: require(path.resolve(process.cwd(), configPath)) };
  })
  .alias("config", "c")
  .option("output", {
    alias: "o",
    describe: "output file",
    type: "string"
  })
  .option("param", {
    alias: "p",
    describe: "param"
  })
  .help()
  .alias("help", "h")
  .version(() => "v" + require("../package.json").version)
  .alias("version", "v")
  .argv;

const scrapist = new Scrapist(argv.schemeData, argv.configData);

(
  typeof argv.param === "undefined" ?
  scrapist.scrape() : scrapist.scrape(argv.param)
)
.then(r => {

  if (argv.output) {
    fs.writeFileSync(argv.output, JSON.stringify(r));
    return;
  }

  console.log(JSON.stringify(r));

}).catch(err => {
  console.error(err);
});
