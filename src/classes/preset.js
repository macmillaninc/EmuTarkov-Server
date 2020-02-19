"use strict";

class ItemPresets {

    constructor() {
        const presets = Object.values(globals.data.ItemPresets);
        const reverse = {};
        for (const p of presets) {
            let tpl = p._items[0]._tpl;
            if (!reverse.hasOwnProperty(tpl)) {
                reverse[tpl] = [];
            }
            reverse[tpl].push(p._id);
        }
        this.lookup = reverse;
    }

    isPreset(id) {
        return globals.data.ItemPresets.hasOwnProperty(id);
    }

    hasPreset(templateId) {
        return this.lookup.hasOwnProperty(templateId);
    }

    getPresets(templateId) {
        if (!this.hasPreset(templateId)) {
            return [];
        }
        const presets = [];
        const ids = this.lookup[templateId];
        for (const id of ids) {
            presets.push(globals.data.ItemPresets[id]);
        }
        return presets;
    }

    getStandardPreset(templateId) {
        if (!this.hasPreset(templateId)) {
            return false;
        }
        const allPresets = this.getPresets(templateId);
        for (const p of allPresets) {
            if (p.hasOwnProperty("_encyclopedia")) {
                return p;
            }
        }
        return allPresets[0];
    }

}

module.exports.itemPresets = new ItemPresets();