"use strict";

function getPath(sessionID) {
	let path = filepaths.user.profiles.storage;
	return path.replace("__REPLACEME__", sessionID);
}

function wearClothing(pmcData, body, sessionID) {
	// in case there is more suites to be wear
	for (let i = 0; i < body.suites.length; i++) {
		let costume_data = customizationOutfits.data[body.suites[i]];

		// this parent reffers to Lower Node
		if (costume_data._parent == "5cd944d01388ce000a659df9") {
			// do only feet
			pmcData.Customization.Feet = costume_data._props.Feet;
		}

		// this parent reffers to Upper Node
		if (costume_data._parent == "5cd944ca1388ce03a44dc2a4") {
			// do only body and hands
			pmcData.Customization.Body = costume_data._props.Body;
			pmcData.Customization.Hands = costume_data._props.Hands;
		}
	}

	return item_f.itemServer.getOutput();
}

function buyClothing(pmcData, body, sessionID) {
	let output = item_f.itemServer.getOutput();
	let item_toPay = body.items;
	let customization_storage = json.parse(json.read(getPath(sessionID)));

	for (let i = 0; i < item_toPay.length; i++) {
		for (let item in pmcData.Inventory.items) {
			if (pmcData.Inventory.items[item]._id == item_toPay[i].id) {
				if (pmcData.Inventory.items[item].upd.StackObjectsCount > item_toPay[i].count) {
					// now change cash
					pmcData.Inventory.items[item].upd.StackObjectsCount = pmcData.Inventory.items[item].upd.StackObjectsCount - item_toPay[i].count;
					output.data.items.change.push({
                        "_id": pmcData.Inventory.items[item]._id,
                        "_tpl": pmcData.Inventory.items[item]._tpl,
                        "parentId": pmcData.Inventory.items[item].parentId,
                        "slotId": pmcData.Inventory.items[item].slotId,
                        "location": pmcData.Inventory.items[item].location,
                        "upd": {"StackObjectsCount": pmcData.Inventory.items[item].upd.StackObjectsCount}
                    });
					break;
				} else if (pmcData.Inventory.items[item].upd.StackObjectsCount == item_toPay[i].count && item_toPay[i].del == true) {
					output.data.items.del.push({"_id": item_toPay[i].id});
                    pmcData.Inventory.items.splice(item, 1);					
				}
			}
		}
	}

	for (let offer of customizationOffers.data) {
		if (body.offer == offer._id) {
			customization_storage.data.suites.push(offer.suiteId);
		}
	}

	json.write(getPath(sessionID), customization_storage);
	return output;
}

module.exports.getPath = getPath;
module.exports.wearClothing = wearClothing;
module.exports.buyClothing = buyClothing;