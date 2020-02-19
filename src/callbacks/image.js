"use strict";

function sendImage(sessionID, req, resp, body) {
    let splittedUrl = req.url.split('/');
    let fileName = splittedUrl[splittedUrl.length - 1].replace(".jpg", "").replace(".png", "");
    let baseNode = {};

    // get images to look through
    if (req.url.includes("/quest")) {
        logger.logInfo("[IMG.quests]:" + req.url);
        baseNode = filepaths.images.quest;
    } else if (req.url.includes("/handbook")) {
        logger.logInfo("[IMG.handbook]:" + req.url);
        baseNode = filepaths.images.handbook;
    } else if (req.url.includes("/avatar")) {
        logger.logInfo("[IMG.trader]:" + req.url);
        baseNode = filepaths.images.trader;
    } else if (req.url.includes("/banners")) {
        logger.logInfo("[IMG.banners]:" + req.url);
        baseNode = filepaths.images.banners;
    } else {
        logger.logInfo("[IMG.hideout]:" + req.url);
        baseNode = filepaths.images.hideout;
    }

    // send image
    server.sendFile(resp, baseNode[fileName]);
}

server.addRespondCallback("IMAGE", sendImage);