"use strict";

const fs = require('fs');
const json = require('./json.js');

function genericSplitter(type, basepath, basefile) {
    let file = json.parse(json.read(basefile));

    for (let element in file.data) {
        let output = "";

        switch (type) {
            case "items":
            case "quests":
            case "traders":
            case "hideoutAreas":
            case "hideoutProd":
            case "hideoutScav":
                output = "db/" + basepath + "/" + file.data[element]._id + ".json";
                json.write(output, file.data[element]);
                break;

            case "languages":
                output = "db/" + basepath + "/" + file.data[element].ShortName + ".json";
                json.write(output, file.data[element]);
                break;

            case "customOutfits":
                output = "db/" + basepath + "/" + element + ".json";
                json.write(output, file.data[element]);
                break;

            case "customOffers":
                output = "db/" + basepath + "/" + file.data[element].suiteId + ".json";
                json.write(output, file.data[element]);
                break;
        }

        console.log("done: " + output);
    }
}

function items() {
    genericSplitter("items", "items", "input/prod.escapefromtarkov.com.client.items.txt");
}

function quests() {
    genericSplitter("quests", "quests", "input/prod.escapefromtarkov.com.client.quest.list.txt");
}

function traders() {
    genericSplitter("traders", "traders", "input/trading.escapefromtarkov.com.client.trading.api.getTradersList.txt");
}

function locations() {
    let file = json.parse(json.read("input/prod.escapefromtarkov.com.client.locations.txt"));

    for (let element in file.data.locations) {
        let output = "db/locations/" + element + ".json";

        json.write(output, file.data.locations[element]);
        console.log("done: " + output);
    }
}

function language() {
    genericSplitter("languages", "locales/languages", "input/prod.escapefromtarkov.com.client.languages.txt");
}

function customizationOutfits() {
    genericSplitter("customOutfits", "customization/outfits", "input/prod.escapefromtarkov.com.client.customization.txt");
}

function customizationOffers() {
    genericSplitter("customOffers", "customization/offers", "input/trading.escapefromtarkov.com.client.trading.customization.5ac3b934156ae10c4430e83c.offers.txt");
}

function hideoutAreas() {
    genericSplitter("hideoutAreas", "hideout/areas", "input/prod.escapefromtarkov.com.client.hideout.areas.txt");
}

function hideoutProduction() {
    genericSplitter("hideoutProd", "hideout/production", "input/prod.escapefromtarkov.com.client.hideout.production.recipes.txt");
}

function hideoutScavcase() {
    genericSplitter("hideoutScav", "hideout/scavcase", "input/prod.escapefromtarkov.com.client.hideout.production.scavcase.recipes.txt");
}

function templates() {
    let file = json.parse(json.read("input/prod.escapefromtarkov.com.client.handbook.templates.txt"));

    for (let element in file.data) {
        let key = file.data[element];

        for (let target in key) {
	        let output = key[target].Id;

            output = "db/templates/" + element.toLowerCase() + "/" + output + ".json";
            json.write(output, key[target]);
            console.log("done: " + output);
        }
    }
}

function assortHelper(assortFile, shortName) {
    let file = json.parse(json.read("input/" + assortFile));

    for (let element in file.data) {
        let key = file.data[element];

        for (let target in key) {
            let output = "";

            if (element === "items") {
                if (key[target].hasOwnProperty("upd")) {
                    // trader has endless supply of item
                    key[target].upd = {UnlimitedCount: true, StackObjectsCount: 500000};
                }

                output = "db/assort/" + shortName + "/"  + "items" + "/" + key[target]._id + ".json";
            } else if (element === "barter_scheme") {
                output = "db/assort/" + shortName + "/"  + "barter" + "/" + target + ".json";
            } else if (element === "loyal_level_items") {
                output = "db/assort/" + shortName + "/"  + "level" + "/" + target + ".json";
            }

            json.write(output, key[target]);
            console.log("done: " + output);
        }
    }
}

function assort() {
    assortHelper("trading.client.trading.api.getTraderAssort.5a7c2eca46aef81a7ca2145d.txt", "5a7c2eca46aef81a7ca2145d");
    assortHelper("trading.client.trading.api.getTraderAssort.5ac3b934156ae10c4430e83c.txt", "5ac3b934156ae10c4430e83c");
    assortHelper("trading.client.trading.api.getTraderAssort.5c0647fdd443bc2504c2d371.txt", "5c0647fdd443bc2504c2d371");
    assortHelper("trading.client.trading.api.getTraderAssort.54cb50c76803fa8b248b4571.txt", "54cb50c76803fa8b248b4571");
    assortHelper("trading.client.trading.api.getTraderAssort.54cb57776803fa99248b456e.txt", "54cb57776803fa99248b456e");
    assortHelper("trading.client.trading.api.getTraderAssort.5935c25fb3acc3127c3d8cd9.txt", "5935c25fb3acc3127c3d8cd9");
    assortHelper("trading.client.trading.api.getTraderAssort.58330581ace78e27b8b10cee.txt", "58330581ace78e27b8b10cee");
}

function localesHelper(language, shortName) {
    let file = json.parse(json.read("input/" + language));

    for (let element in file.data) {
        if (element === "interface" || element === "error") {
            let output = "db/locales/" + shortName + "/" + element +  ".json";

            json.write(output, file.data[element]);
            console.log("done: " + output);
            continue;
        }

        let key = file.data[element];

        for (let target in key) {
            let output = "db/locales/" + shortName + "/"  + element + "/" + target + ".json";

            json.write(output, key[target]);
            console.log("done: " + output);
        }
    }
}

function locales() {
	localesHelper("prod.escapefromtarkov.com.client.locale.en.txt", "en");
	localesHelper("prod.escapefromtarkov.com.client.locale.ru.txt", "ru");
	localesHelper("prod.escapefromtarkov.com.client.locale.ge.txt", "ge");
	localesHelper("prod.escapefromtarkov.com.client.locale.fr.txt", "fr");
	localesHelper("prod.escapefromtarkov.com.client.locale.po.txt", "po");
	localesHelper("prod.escapefromtarkov.com.client.locale.es.txt", "es");
    localesHelper("prod.escapefromtarkov.com.client.locale.es-mx.txt", "es-mx");
    localesHelper("prod.escapefromtarkov.com.client.locale.ch.txt", "ch");
}

function generateEverythingTrader() {
    let inputFiles = fs.readdirSync("db/items/");
    let itemFiles = fs.readdirSync("db/templates/items/");

    for (let file in inputFiles) {
        let filePath = "db/items/" + inputFiles[file];
        let fileData = json.parse(json.read(filePath));
        let fileName = fileData._id;
        let price = 0;

        if (fileData._type !== "Item") {
            continue;
        }

        // get item price
        for (let itemFile in itemFiles) {
            let template = json.parse(json.read("db/templates/items/" + itemFiles[itemFile]));

            if (fileData._id === template.Id) {
                price = template.Price;
                break;
            }
        }

        if (price === 0 || price === 1 || price === 100) {
            continue;
        }

        // save everything
        json.write("db/assort/ragfair/items/" + fileName + ".json", {_id: fileData._id, _tpl: fileData._id, parentId: "hideout", slotId: "hideout", upd: {UnlimitedCount: true, StackObjectsCount: 500000}});
        json.write("db/assort/ragfair/barter/" + fileName + ".json", [[{count: price, _tpl: "5449016a4bdc2d6f028b456f"}]]);
        json.write("db/assort/ragfair/level/" + fileName + ".json", 1);

        console.log("done: ragfair <- " + fileName);
    }
}

module.exports.items = items;
module.exports.quests = quests;
module.exports.traders = traders;
module.exports.locations = locations;
module.exports.language = language;
module.exports.customizationOutfits = customizationOutfits;
module.exports.customizationOffers = customizationOffers;
module.exports.hideoutAreas = hideoutAreas;
module.exports.hideoutProduction = hideoutProduction;
module.exports.hideoutScavcase = hideoutScavcase;
module.exports.templates = templates;
module.exports.assort = assort;
module.exports.locales = locales;
module.exports.generateEverythingTrader = generateEverythingTrader;