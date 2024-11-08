// PS: I will soon improve this to release as a template on the Minecraft Addons Discord server

let colors = ["light_gray", "gray", "black", "brown", "red", "orange", "yellow", "lime", "green", "cyan", "light_blue", "blue", "purple", "magenta", "pink"];

let entryBlocks = [];

colors.forEach(function (color) {
    entryBlocks.push({
        inputBlock: `minecraft:${color}_concrete_powder`,
        outputBlock: `minecraft:white_concrete_powder`,
        interactionParticle: "kana_po:soapy_particle",
        interactionSound: "jump.honey_block",
        itemTag: "kana_po:soap",
        itemType: "Stackable",
    });
    entryBlocks.push({
        inputBlock: `minecraft:${color}_concrete`,
        outputBlock: `minecraft:concrete`,
        interactionParticle: "kana_po:soapy_particle",
        interactionSound: "jump.honey_block",
        itemTag: "kana_po:soap",
        itemType: "Stackable",
    });
    entryBlocks.push({
        inputBlock: `minecraft:${color}_carpet`,
        outputBlock: `minecraft:white_carpet`,
        interactionParticle: "kana_po:soapy_particle",
        interactionSound: "jump.honey_block",
        itemTag: "kana_po:soap",
        itemType: "Stackable",
    });
    entryBlocks.push({
        inputBlock: `minecraft:${color}_wool`,
        outputBlock: `minecraft:white_wool`,
        interactionParticle: "kana_po:soapy_particle",
        interactionSound: "jump.honey_block",
        itemTag: "kana_po:soap",
        itemType: "Stackable",
    });
    entryBlocks.push({
        inputBlock: `minecraft:${color}_stained_glass`,
        outputBlock: `minecraft:glass`,
        interactionParticle: "kana_po:soapy_particle",
        interactionSound: "jump.honey_block",
        itemTag: "kana_po:soap",
        itemType: "Stackable",
    });
    entryBlocks.push({
        inputBlock: `minecraft:${color}_stained_glass_pane`,
        outputBlock: `minecraft:glass_pane`,
        interactionParticle: "kana_po:soapy_particle",
        interactionSound: "jump.honey_block",
        itemTag: "kana_po:soap",
        itemType: "Stackable",
    });
    entryBlocks.push({
        inputBlock: `minecraft:${color}_terracotta`,
        outputBlock: `minecraft:white_terracotta`,
        interactionParticle: "kana_po:soapy_particle",
        interactionSound: "jump.honey_block",
        itemTag: "kana_po:soap",
        itemType: "Stackable",
    });
});

export { entryBlocks };
