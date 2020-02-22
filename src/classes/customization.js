"use strict";

let customization = undefined;

function initialize() {
	customization = json.parse(json.read(db.user.cache.customization));
}

function getCustomization() {
	return customization;
}

function getPath(sessionID) {
	let path = db.user.profiles.storage;
	return path.replace("__REPLACEME__", sessionID);
}

function wearClothing(pmcData, body, sessionID) {
	// in case there is more suites to be wear
	for (let i = 0; i < body.suites.length; i++) {
		let suite = customization.data[body.suites[i]];

		// this parent reffers to Lower Node
		if (suite._parent == "5cd944d01388ce000a659df9") {
			// do only feet
			pmcData.Customization.Feet = suite._props.Feet;
		}

		// this parent reffers to Upper Node
		if (suite._parent == "5cd944ca1388ce03a44dc2a4") {
			// do only body and hands
			pmcData.Customization.Body = suite._props.Body;
			pmcData.Customization.Hands = suite._props.Hands;
		}
	}

	return item_f.itemServer.getOutput();
}

function buyClothing(pmcData, body, sessionID) {
	let output = item_f.itemServer.getOutput();
	let storage = json.parse(json.read(getPath(sessionID)));
	let itemsToPay = [];

    // get the price of all items
    for (let key of body.items) {
        for (let item of pmcData.Inventory.items) {
            if (item._id === key) {
                let template = json.parse(json.read(db.templates.items[item._tpl]));
                itemsToPay.push({"id": item._id, "count": Math.round(template.Price)});
                break;
            }
        }
    }

    // pay the item	to profile
    if (!itm_hf.payMoney(pmcData, {scheme_items: itemsToPay, tid: body.tid}, sessionID)) {
        logger.LogError("no money found");
        return "";
    }

	for (let offer of trader_f.traderServer.getCustomization(body.tid)) {
		if (body.offer == offer._id) {
			storage.data.suites.push(offer.suiteId);
		}
	}

	json.write(getPath(sessionID), storage);
	return output;
}

module.exports.initialize = initialize;
module.exports.getCustomization = getCustomization;
module.exports.getPath = getPath;
module.exports.wearClothing = wearClothing;
module.exports.buyClothing = buyClothing;