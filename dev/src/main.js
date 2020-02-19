"use strict";

const split = require('./split.js');
const cache = require('./cache.js');
const shit = require('./shit.js');

function splitAll() {
    console.log("Splitting files...");

    split.items();
    split.quests();
    split.traders();
    split.locations();
    split.language();
    split.customizationOutfits();
    split.customizationOffers();
    split.hideoutAreas();
    split.hideoutProduction();
    split.hideoutScavcase();
    split.templates();
    split.assort();
    split.locales();
    split.generateEverythingTrader();

    console.log("Splitting done");
}

splitAll();
//cache.all();