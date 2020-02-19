"use strict";

const fs = require('fs');

function getModFilepath(mod) {
    return "user/mods/" + mod.author + "-" + mod.name + "-" + mod.version + "/";
}

function scanRecursive(filepath, baseNode, modNode) {
    if (typeof modNode === "object") {
        for (let node in modNode) {
            baseNode[node] = scanRecursive(filepath, baseNode[node], modNode[node]);
        }
    }

    if (typeof modNode === "string") {
        baseNode = filepath + modNode;
    }

    return baseNode;
}

function loadMod(mod, filepath) {
    logger.logInfo("Loading mod " + mod.author + "-" + mod.name + "-" + mod.version);

    let loadorder = json.parse(json.read("user/cache/loadorder.json"));

    filepaths = scanRecursive(filepath, filepaths, mod.db);
    loadorder = scanRecursive(filepath, loadorder, mod.src);

    json.write("user/cache/loadorder.json", loadorder);
}

function detectChanged() {
    let changed = false;

    for (let mod of settings.mods.list) {
        if (!fs.existsSync(getModFilepath(mod) + "mod.config.json")) {
            changed = true;
            break;
        }

        let config = json.parse(json.read(getModFilepath(mod) + "mod.config.json"));

        if (mod.name !== config.name || mod.author !== config.author || mod.version !== config.version) {
            changed = true;
            break;
        }
    }

    if (changed) {
        settings.mods.list = [];
    }

    return changed;
}

function detectMissing() {
    if (!fs.existsSync("user/mods/")) {
        return;
    }

    let dir = "user/mods/";
    let mods = utility.getDirList(dir);

    for (let mod of mods) {
        /* check if config exists */
        if (!fs.existsSync(dir + mod + "/mod.config.json")) {
            logger.logError("Mod " + mod + " is missing mod.config.json");
            logger.logError("Forcing server shutdown...");
            process.exit(1);
        }

        let config = json.parse(json.read(dir + mod + "/mod.config.json"));
        let found = false;

        /* check if mod is already in the list */
        for (let installed of settings.mods.list) {
            if (installed.name === config.name) {
                logger.logWarning("Mod " + mod + " has already been added; skipping mod");
                found = true;
                break;
            }
        }

        /* add mod to the list */
        if (!found) {
            logger.logWarning("Mod " + mod + " not installed, adding it to the modlist");
            settings.mods.list.push({"name": config.name, "author": config.author, "version": config.version, "enabled": true});
            settings.server.rebuildCache = true;
            json.write("user/server.config.json", settings);
        }
    }
}

function isRebuildRequired() {
    if (!fs.existsSync("user/cache/mods.json")) {
        return true;
    }

    let modlist = settings.mods.list;
    let cachedlist = json.parse(json.read("user/cache/mods.json"));

    if (modlist.length !== cachedlist.length) {
        return true;
    }

    for (let mod in modlist) {
        /* check against cached list */
        if (modlist[mod].name !== cachedlist[mod].name
        || modlist[mod].author !== cachedlist[mod].author
        || modlist[mod].version !== cachedlist[mod].version
        || modlist[mod].enabled !== cachedlist[mod].enabled) {
            return true;
        }
    }

    return false;
}

function load() {
    let modList = settings.mods.list;

    for (let element of modList) {
        // skip mod
        if (!element.enabled) {
            logger.logWarning("Skipping mod " + element.author + "-" + element.name + "-" + element.version);
            continue;
        }

        // apply mod
        let filepath = getModFilepath(element);
        let mod = json.parse(json.read(filepath + "mod.config.json"));
        loadMod(mod, filepath);
    }
}

module.exports.detectChanged = detectChanged;
module.exports.detectMissing = detectMissing;
module.exports.isRebuildRequired = isRebuildRequired;
module.exports.load = load;
