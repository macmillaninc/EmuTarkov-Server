"use strict";

/*
* Quest status values
* 0 - Locked
* 1 - AvailableForStart
* 2 - Started
* 3 - AvailableForFinish
* 4 - Success
* 5 - Fail
* 6 - FailRestartable
* 7 - MarkedAsFailed
*/

const questsCache = json.read(filepaths.user.cache.quests);

function getQuestsCache() {
    return questsCache;
}

function acceptQuest(pmcData, body, sessionID) {
    let found = false;
    // If the quest already exists, update its status
    for (const q of pmcData.Quests) {
        if (q.qid == body.qid) {
            q.startTime = utility.getTimestamp();
            q.status = "Started";
            found = true;
            break;
        }
    }
    // Otherwise, add it
    if (!found) {
        pmcData.Quests.push({
            "qid": body.qid,
            "startTime": utility.getTimestamp(),
            "status": "Started"
        });
    }

    // Create a dialog message for starting the quest.
    // Note that for starting quests, the correct locale field is "description", not "startedMessageText".
    let quest = json.parse(json.read(filepaths.quests[body.qid]));
    let questLocale = json.parse(json.read(filepaths.locales["en"].quest[body.qid]));
    let messageContent = {templateId: questLocale.description, type: dialogue_f.getMessageTypeValue('questStart')};

    dialogue_f.dialogueServer.addDialogueMessage(quest.traderId, messageContent, sessionID);
    return item_f.itemServer.getOutput();
}

function completeQuest(pmcData, body, sessionID) {
    for (let quest in pmcData.Quests) {
        if (pmcData.Quests[quest].qid === body.qid) {
            pmcData.Quests[quest].status = "Success";
            break;
        }
    }

    // give reward
    let quest = json.parse(json.read(filepaths.quests[body.qid]));
    let questRewards = [];

    for (let reward of quest.rewards.Success) {
        switch (reward.type) {
            case "Item":
                for (let rewardItem of reward.items) {
                    // Quest rewards bundle up items whose max stack size is 1. Break them up.
                    let itemTmplData = json.parse(json.read(filepaths.items[rewardItem._tpl]));

                    if ("upd" in rewardItem && itemTmplData._props.StackMaxSize === 1) {
                        let count = rewardItem.upd.StackObjectsCount;
                        
                        rewardItem.upd.StackObjectsCount = 1;
                        
                        for (let i = 0; i < count; i++) {
                            questRewards.push(rewardItem);
                        }

                        continue;
                    }

                    questRewards.push(rewardItem);
                }
                break;

            case "Skill":
                pmcData = profile_f.profileServer.getPmcProfile(sessionID);

                for (let skill of pmcData.Skills.Common) {
                    if (skill.Id === reward.target) {
                        skill.Progress += parseInt(reward.value);
                        break;
                    }
                }
                break;

            case "Experience":
                pmcData = profile_f.profileServer.getPmcProfile(sessionID);
                pmcData.Info.Experience += parseInt(reward.value);
                break;

            case "TraderStanding":
                pmcData = profile_f.profileServer.getPmcProfile(sessionID);
                pmcData.TraderStandings[quest.traderId].currentStanding += parseFloat(reward.value);
                trader_f.traderServer.lvlUp(quest.traderId, sessionID);
                break;
        }
    }

    // De-dupe quest rewards.
    if (questRewards.length > 0) {
        questRewards = itm_hf.replaceIDs(pmcData, questRewards);
    }

    // Create a dialog message for completing the quest.
    let questDb = json.parse(json.read(filepaths.quests[body.qid]));
    let questLocale = json.parse(json.read(filepaths.locales["en"].quest[body.qid]));
    let messageContent = {
        templateId: questLocale.successMessageText,
        type: dialogue_f.getMessageTypeValue('questSuccess')
    };

    dialogue_f.dialogueServer.addDialogueMessage(questDb.traderId, messageContent, sessionID, questRewards);
    return item_f.itemServer.getOutput();
}

// TODO: handle money
function handoverQuest(pmcData, body, sessionID) {    
    let output = item_f.itemServer.getOutput();
    let counter = 0;
    
    for (let itemHandover of body.items) {
        counter += itemHandover.count;
        output = move_f.removeItem(pmcData, itemHandover.id, output, sessionID);
    }

    if (pmcData.BackendCounters.hasOwnProperty(body.conditionId)) {
        pmcData.BackendCounters[body.conditionId].value += counter;
    } else {
        pmcData.BackendCounters[body.conditionId] = {"id": body.conditionId, "qid": body.qid, "value": counter};
    }

    return output;
}

module.exports.getQuestsCache = getQuestsCache;
module.exports.acceptQuest = acceptQuest;
module.exports.completeQuest = completeQuest;
module.exports.handoverQuest = handoverQuest;
