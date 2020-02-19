"use strict";

const fs = require('fs');
const json = require('./json.js');

let filepaths = undefined;

function flushFilepaths() {
    filepaths = json.parse(json.read("db/base/filepaths.json"));
}

function dumpFilepaths() {
    json.write("user/cache/filepaths.json", filepaths);
    console.log("done: filepaths.json");
}

function setFilePath(type, fileName, filePath) {
    switch (type) {
        case "items": filepaths.items[fileName] = filePath; break;
        case "quests": filepaths.quests[fileName] = filePath; break;
        case "traders": filepaths.traders[fileName] = filePath; break;
        case "locations": filepaths.locations[fileName] = filePath; break;
        case "languages": filepaths.locales.languages[fileData.ShortName] = filePath; break;
        case "customOutfits": filepaths.customization.outfits[fileName] = filePath; break;
        case "customOffers": filepaths.customization.offers[fileName] = filePath; break;
        case "hideoutAreas": filepaths.hideout.areas[fileName] = filePath; break;
        case "hideoutProd": filepaths.hideout.production[fileName] = filePath; break;
        case "hideoutScav": filepaths.hideout.scavcase[fileName] = filePath; break;
        case "weather": filepaths.weather[fileName] = filePath; break;
        case "maps": filepaths.maps[fileName] = filePath; break;
        case "bots": filepaths.bots.inventory[fileName] = filePath; break;
    }
}

function genericCacher(type, basepath, cachename) {
    let base = json.parse(json.read("db/base/" + cachename));
    let inputDir = "db/" + basepath + "/";
    let inputFiles = fs.readdirSync(inputDir);

    for (let file in inputFiles) {
        let filePath = inputDir + inputFiles[file];
        let fileData = json.parse(json.read(filePath));
        let fileName = "";

        switch (type) {
            case "customOffers":
            case "hideoutAreas":
            case "hideoutProd":
            case "hideoutScav":
                fileName = inputFiles[file].replace(".json", "");
                base.data.push(fileData);
                break;

            case "quests":
            case "traders":
                fileName = fileData._id;
                base.data.push(fileData);
                break;

            case "items":
                fileName = fileData._id;
                base.data[fileName] = fileData;
                break;

            case "locations":
                fileName = inputFiles[file].replace(".json", "");
                base.data.locations[fileName] = fileData;
                break;
            
            case "languages":
                base.data.push(fileData);
                break;

            case "customOutfits":
                fileName = inputFiles[file].replace(".json", "");
                base.data[fileName] = fileData;
                break;
        }

        console.log("done: " + cachename + " <- " + filePath);

        setFilePath(type, fileName, filePath);
    }

    json.write("user/cache/" + cachename, base);
}

function items() {
    genericCacher("items", "items", "items.json");
}

function quests() {
    genericCacher("quests", "quests", "quests.json");
}

function traders() {
    genericCacher("traders", "traders", "traders.json");
}

function locations() {
    genericCacher("locations", "locations", "locations.json");
}

function languages() {
    genericCacher("languages", "locales/languages", "locale_languages.json");
}

function customizationOutfits() {
    genericCacher("customOutfits", "customization/outfits", "customization_outfits.json");
}

function customizationOffers() {
    genericCacher("customOffers", "customization/offers", "customization_offers.json");
}

function hideoutAreas() {
    genericCacher("hideoutAreas", "hideout/areas", "hideout_areas.json");
}

function hideoutProduction() {
    genericCacher("hideoutProd", "hideout/production", "hideout_production.json");
}

function hideoutScavcase() {
    genericCacher("hideoutScav", "hideout/scavcase", "hideout_scavcase.json");
}

function templates() {
    let base = json.parse(json.read("db/base/templates.json"));
    let inputDir = [
        "db/templates/Categories/",
        "db/templates/Items/"
    ];

    for (let path in inputDir) {
        let inputFiles = fs.readdirSync(inputDir[path]);

        for (let file in inputFiles) {
            let filePath = inputDir[path] + inputFiles[file];
            let fileData = json.parse(json.read(filePath));
            let fileName = inputFiles[file].replace(".json", "");

            if (path == 0) {
                base.data.Categories.push(fileData);
                filepaths.templates.categories[fileName] = filePath;
            } else {
                base.data.Items.push(fileData);
                filepaths.templates.items[fileName] = filePath;
            }
            
            console.log("done: templates.json <- " + filePath);
        }
    }

    json.write("user/cache/templates.json", base);
}

function getLocaleFilepaths(shortName) {
    switch (shortName) {
        case "ru": return filepaths.locales.ru;
        case "ge": return filepaths.locales.ge;
        case "fr": return filepaths.locales.fr;
        default: return filepaths.locales.en;
    }
}

function localesHelper(shortName) {
    let base = json.parse(json.read("db/base/locale.json"));
    let localeFilepath = getLocaleFilepaths(shortName);

    let inputDir = [
        "db/locales/" + shortName + "/mail/",
        "db/locales/" + shortName + "/quest/",
        "db/locales/" + shortName + "/preset/",
        "db/locales/" + shortName + "/handbook/",
        "db/locales/" + shortName + "/season/",
        "db/locales/" + shortName + "/templates/",
        "db/locales/" + shortName + "/locations/",
        "db/locales/" + shortName + "/banners/",
        "db/locales/" + shortName + "/trading/",
    ];

    base.data.interface = json.parse(json.read("db/locales/" + shortName + "/interface.json"));
    base.data.error = json.parse(json.read("db/locales/" + shortName + "/error.json"));
    localeFilepath.interface = "db/locales/" + shortName + "/interface.json";
    localeFilepath.error = "db/locales/" + shortName + "/error.json";

    for (let path in inputDir) {
        let inputFiles = fs.readdirSync(inputDir[path]);
        
        for (let file in inputFiles) {
            let filePath = inputDir[path] + inputFiles[file];
            let fileData = json.parse(json.read(filePath));
            let fileName = inputFiles[file].replace(".json", "");

            if (path == 0) {
                base.data.mail[fileName] = fileData;
                localeFilepath.mail[fileName] = filePath;
            } else if (path == 1) {
                base.data.quest[fileName] = fileData;
                localeFilepath.quest[fileName] = filePath;
            } else if (path == 2) {
                base.data.preset[fileName] = fileData;
                localeFilepath.preset[fileName] = filePath;
            } else if (path == 3) {
                base.data.handbook[fileName] = fileData;
                localeFilepath.handbook[fileName] = filePath;
            } else if (path == 4) {
                base.data.season[fileName] = fileData;
                localeFilepath.season[fileName] = filePath;
            } else if (path == 5) {
                base.data.templates[fileName] = fileData;
                localeFilepath.templates[fileName] = filePath;
            } else if (path == 6) {
                base.data.locations[fileName] = fileData;
                localeFilepath.locations[fileName] = filePath;
            } else if (path == 7) {
                base.data.banners[fileName] = fileData;
                localeFilepath.banners[fileName] = filePath;
            } else if (path == 8) {
                base.data.trading[fileName] = fileData;
                localeFilepath.trading[fileName] = filePath;
            }
            
            console.log("done: locale_" + shortName + ".json <- " + filePath);
        }
    }

    json.write("user/cache/locale_" + shortName + ".json", base);

    switch (shortName) {
        case "ru": filepaths.locales.ru = localeFilepath; break;
        case "ge": filepaths.locales.ge = localeFilepath; break;
        case "fr": filepaths.locales.fr = localeFilepath; break;
        default: filepaths.locales.en = localeFilepath; break;
    }
}

function locales() {
    localesHelper("en");
    localesHelper("ge");
    localesHelper("fr");
    localesHelper("ru");
    localesHelper("es");
    localesHelper("es-mx");
    localesHelper("po");
}

function weather() {
    let inputDir = "db/weather/";
    let inputFiles = fs.readdirSync(inputDir);
    
    for (let file in inputFiles) {
        let filePath = inputDir[path] + inputFiles[file];
        let fileName = inputFiles[file].replace(".json", "");
        
        setFilePath("weather", fileName, filePath);
    }
}

function maps() {
    let inputDir = "db/maps/";
    let inputFiles = fs.readdirSync(inputDir);
    
    for (let file in inputFiles) {
        let filePath = inputDir[path] + inputFiles[file];
        let fileName = inputFiles[file].replace(".json", "");
        
        setFilePath("maps", fileName, filePath);
    }
}

function bots() {
    let inputDir = "db/bots/inventory/";
    let inputFiles = fs.readdirSync(inputDir);

    filepaths.bots.base = "db/bots/base.json";
    filepaths.bots.names = "db/bots/names.json";
    filepaths.bots.outfits = "db/bots/outfits.json";
    
    for (let file in inputFiles) {
        let filePath = inputDir[path] + inputFiles[file];
        let fileName = inputFiles[file].replace(".json", "");
        
        setFilePath("bots", fileName, filePath);
    }
}

function images() {
    let inputDir = [
        "res/images/banners/",
        "res/images/handbook/",
        "res/images/hideout/",
        "res/images/quest/",
        "res/images/trader/",
    ];

    for (let path in inputDir) {
        let inputFiles = fs.readdirSync(inputDir[path]);
        
        for (let file in inputFiles) {
            let filePath = inputDir[path] + inputFiles[file];
            let fileName = inputFiles[file].replace(".png", "").replace(".jpg", "");

            if (path == 0) {
                filepaths.images.banners[fileName] = filePath;
            } else if (path == 1) {
                filepaths.images.handbook[fileName] = filePath;
            } else if (path == 2) {
                filepaths.images.hideout[fileName] = filePath;
            } else if (path == 3) {
                filepaths.images.quest[fileName] = filePath;
            } else if (path == 4) {
                filepaths.images.trader[fileName] = filePath;
            }
        }
    }
}

function all() {
    if (fs.existsSync("user/cache/filepaths.json")) {
        return;
    }

    console.log("Caching files...");

    flushFilepaths();
    //items();
    //quests();
    //traders();
    //locations();
    //languages();
    //customizationOutfits();
    //customizationOffers();
    //hideoutAreas();
    //hideoutProduction();
    //hideoutScavcase();
    //templates();
    locales();
    //weather();
    //maps();
    //bots();
    //images();
    dumpFilepaths();

    console.log("Caching done");
}

module.exports.all = all;