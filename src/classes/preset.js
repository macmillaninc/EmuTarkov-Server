"use strict";

class ItemPresets {
    constructor() {
        const presets = Object.values(globals.data.ItemPresets);
        const reverse = {};

        for (const p of presets) {
            let tpl = p._items[0]._tpl;

            if (!(tpl in reverse)) {
                reverse[tpl] = [];
            }

            reverse[tpl].push(p._id);
        }

        this.lookup = reverse;
    }

    isPreset(id) {
        return id in globals.data.ItemPresets;
    }

    hasPreset(templateId) {
        return templateId in this.lookup;
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
            if ("_encyclopedia" in p) {
                return p;
            }
        }

        return allPresets[0];
    }
}

module.exports.itemPresets = new ItemPresets();