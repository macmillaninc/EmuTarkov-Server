"use strict";

require('../libs.js');

function getRandomValue(node) {
	let keys = Object.keys(node);
	return json.parse(json.read(node[keys[utility.getRandomInt(0, keys.length - 1)]]));
}

function getBotNode(type) {
	type = type.toLowerCase();

	if (type === "bear" || type === "usec") {
		return filepaths.bots.pmc[type];
	}

	return filepaths.bots.scav[type];
}

function addDogtag(bot) {
	let dogtagItem = {
		_id: "dogtag_" + 100000000 + utility.getRandomIntEx(899999999),
		_tpl: "__REPLACEME__",
		parentId: bot.Inventory.equipment,
		slotId: "Dogtag",
		upd: {
			"Dogtag": {
				"Nickname": bot.Info.Nickname,
				"Side": bot.Info.Side,
				"Level": bot.Info.Level,
				"Time": "2020-01-01T00:00:00",
				"Status": "Killed by JET",
				"KillerName": 'JustEmuTarkov',
				"WeaponName": "JET Reverse Engineering"
			},
			"SpawnedInSession": "true"
		}
	}

	if (bot.Info.Side === 'Usec') {
		dogtagItem._tpl = "59f32c3b86f77472a31742f0";
	} else {
		dogtagItem._tpl = "59f32bb586f774757e1e8442";
	}

	bot.Inventory.items.push(dogtagItem);
	return bot;
}

function removeSecureContainer(bot) {
	let idsToRemove = [];

	for (let item of bot.Inventory.items) {
        if (item.slotId === "SecuredContainer") {
			idsToRemove = itm_hf.findAndReturnChildren(bot, item._id);
        }
	}
	
	if (idsToRemove.length > 0) {
		for (let itemId of idsToRemove) {
			for (let index in bot.Inventory.items) {
				if (bot.Inventory.items[index]._id === itemId) {
					bot.Inventory.items.splice(index, 1);
				}
			}
		}
	}

	return bot;
}

function generateBot(bot, role) {
	let type = role;

	if (role === "cursedAssault") {
		type = "assault";
	}

	// chance to spawn simulated PMC players
	if (((type === "assault" || type === "marksman" || type === "pmcBot") && settings.gameplay.bots.pmcEnabled)) {
		let spawnChance = utility.getRandomInt(0, 99);
		let sideChance = utility.getRandomInt(0, 99);

		if (spawnChance < settings.gameplay.bots.pmcSpawnChance) {
			if (sideChance < settings.gameplay.bots.pmcUsecChance) {
				bot.Info.Side = "Usec";
				type = "usec";
			} else {
				bot.Info.Side = "Bear";
				type = "bear";
			}

			bot.Info.Level = utility.getRandomInt(1, 70);
		}
	}

	// we don't want player scav to be generated as PMC
	if (role === "playerScav") {
		type = "assault";
	}

	// generate bot
	let botNode = getBotNode(type);

	bot.Info.Settings.Role = role;
	bot.Info.Nickname = getRandomValue(botNode.names);
	bot.Info.Settings.Experience = getRandomValue(botNode.experience);
	bot.Info.Voice = getRandomValue(botNode.appearance.voice);
	bot.Health = getRandomValue(botNode.health);
	bot.Customization.Head = getRandomValue(botNode.appearance.head);
	bot.Customization.Body = getRandomValue(botNode.appearance.body);
	bot.Customization.Feet = getRandomValue(botNode.appearance.feet);
	bot.Customization.Hands = getRandomValue(botNode.appearance.hands);
	bot.Inventory = getRandomValue(botNode.inventory);

	// remove secure container
	bot = removeSecureContainer(bot);

	// add dogtag to PMC's		
	if (type === "usec" || type === "bear") {
		bot = addDogtag(bot);
	}
	
	return bot;
}

function generate(databots) {
	let generatedBots = []; 

	for (let condition of databots.conditions) {
		for (let i = 0; i < condition.Limit; i++)  {
			let bot = json.parse(json.read(filepaths.bots.base));

			bot._id = "bot" + utility.getRandomIntEx(99999999);
			bot.Info.Settings.BotDifficulty = condition.Difficulty;
			bot = generateBot(bot, condition.Role);
			generatedBots.unshift(bot);
		}
	}

	return {"err": 0,"errmsg": null, "data": generatedBots};
}

function generatePlayerScav() {
	let scavData = generate({"conditions":[{"Role":"playerScav","Limit":1,"Difficulty":"normal"}]}).data;

	scavData[0].Info.Settings = {};
	return scavData[0];
}

module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;