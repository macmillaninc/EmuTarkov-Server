"use strict";

class Interpreter {
    constructor() {
        this.initializeCore();
        this.initializeExceptions();
        this.initializeLoadOrder();
        this.initializeData();
        this.initializeClasses();
        this.initializeResponses();
        this.initializeCallbacks();
    }

    /* load loadorder from cache */
    initializeLoadOrder() {
        this.loadorder = json.parse(json.read("user/cache/loadorder.json"));
    }

    initializeCore() {
        /* setup utilites */
        global.utility = require('./util/utility.js');
        global.logger = (require('./util/logger.js').logger);
        global.json = require('./util/json.js');

        /* setup core files */
        global.settings = json.parse(json.read("user/server.config.json"));
        global.filepaths = json.parse(json.read("db/cache/filepaths.json"));

        /* setup routes and cache */
        const route = require('./caching/route.js');
        const cache = require('./caching/cache.js');
        route.all();
        cache.all();

        /* core logic */
        global.router = (require('./server/router.js').router);
        global.events = require('./server/events.js');
        global.server = (require('./server/server.js').server);
        global.watermark = require('./server/watermark.js');
    }

    /* load exception handler */
    initializeExceptions() {
        process.on('uncaughtException', (error, promise) => {
            logger.logError("Server:" + server.getVersion());
            logger.logError("Trace:");
            logger.logData(error);
        });
    }

    /* TODO: REFACTOR THIS */
    initializeData() {
        global.items = json.parse(json.read(filepaths.user.cache.items));
        global.globals = json.parse(json.read(filepaths.globals));
        global.customizationOutfits = json.parse(json.read(filepaths.user.cache.customization_outfits));
        global.customizationOffers = json.parse(json.read(filepaths.user.cache.customization_offers));
        global.templates = json.parse(json.read(filepaths.user.cache.templates));
    }

    /* load classes */
    initializeClasses() {
        for (let name in this.loadorder.classes) {
            logger.logInfo("Interpreter: class " + name);
            global[name] = require("../" + this.loadorder.classes[name]);
        }
    }

    /* load responses */
    initializeResponses() {
        for (let name in this.loadorder.responses) {
            logger.logInfo("Interpreter: response " + name);
            require("../" + this.loadorder.responses[name]);
        }
    }

    /* load callbacks */
    initializeCallbacks() {
        for (let name in this.loadorder.callbacks) {
            logger.logInfo("Interpreter: callback " + name);
            require("../" + this.loadorder.callbacks[name]);
        }
    }
}

module.exports.interpreter = new Interpreter();