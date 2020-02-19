"use strict"

const fs = require('fs');
const json = require('./json.js');

function getRandomInt(min = 0, max = 100) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (max > min) ? Math.floor(Math.random() * (max - min + 1) + min) : min;
}

function makeSign(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
}

function generateNewItemId() {
    let getTime = new Date();
    let month = getTime.getMonth().toString();
    let date = getTime.getDate().toString();
    let hour = getTime.getHours().toString();
    let minute = getTime.getMinutes().toString();
    let second = getTime.getSeconds().toString();
    let random = getRandomInt(1000000000, 9999999999).toString();
    let retVal = "I" + (month + date + hour + minute + second + random).toString();
    let sign = makeSign(24 - retVal.length).toString();
    
    return retVal + sign;
}

function replaceInventoryIds(Inventory) {
    // replace bsg shit long ID with proper one
    let string_inventory = json.stringify(Inventory.items);

	console.log(Inventory.items.length);

    for (let item of Inventory.items) {
        if (item._id === Inventory.equipment) {
            continue;
        }

        if (item._id === Inventory.questRaidItems) {
            continue;
        }

        if (item._id === Inventory.questStashItems) {
            continue;
        }

		// replace id
		console.log(item._id);
        string_inventory = string_inventory.replace(item._id, generateNewItemId());
    }

	let result = JSON.parse(string_inventory);
    return result;
}

function fixBotProfiles() {	
	let inputDir = "input/bots/";
	let inputFiles = fs.readdirSync(inputDir);
	
	for (let file in inputFiles) {
		let filePath = inputDir + inputFiles[file];
		let fileData = json.parse(json.read(filePath));

		console.log(fileData);
		fileData.items = replaceInventoryIds(fileData);			
		json.write(filePath, fileData);
	}
}

module.exports.fixBotProfiles = fixBotProfiles;