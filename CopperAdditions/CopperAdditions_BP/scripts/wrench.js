import { world, EquipmentSlot, BlockStates, system } from "@minecraft/server";

// Record to store the player's currently selected block property
const record = {};
// Record to store the cooldown time for each player
const cooldown = {};

// List of allowed block states that can be modified by the wrench
const allowedStatesNormal = [
    "minecraft:cardinal_direction", "weirdo_direction",
    "vertical_half", "pillar_axis", "facing",
    "facing_direction", "minecraft:facing_direction",
    "ground_sign_direction", "orientation", "direction",
    "minecraft:direction", "rail_direction", "minecraft:vertical_half"
];
const allowedStatesSneaking = [
    "upside_down_bit", "attachment",
];

// Checks if the player is holding an item tagged as "kana_ca:wrench"
function isHoldingWrench(player) {
    const mainhand = player.getComponent('minecraft:equippable');
    const item = mainhand.getEquipment(EquipmentSlot.Mainhand);
    return item && item.hasTag("kana_ca:wrench");
}

// Damages the item in the player's main hand and breaks it if its durability reaches zero
function damageItem(item, player) {
    if (item && item.hasComponent("minecraft:durability") && player.getGameMode() !== 'creative') {
        const durabilityComponent = item.getComponent("minecraft:durability");
        durabilityComponent.damage += 1; // Increment damage by 1

        // Check if the item has reached its max durability (i.e., broken)
        if (durabilityComponent.damage >= durabilityComponent.maxDurability) {
            // Remove the item from the player's main hand and play the break sound
            player.getComponent('minecraft:equippable').setEquipment(EquipmentSlot.Mainhand, null);
            player.playSound("random.break");
        } else {
            // Update the item with increased damage value
            const mainhand = player.getComponent('minecraft:equippable');
            mainhand.setEquipment(EquipmentSlot.Mainhand, item);
        }
    }
}

// Checks if enough time has passed since the player's last interaction (cooldown system)
function hasCooldownExpired(player) {
    const currentTime = system.currentTick;
    const lastUse = cooldown[player.id] || 0;
    const cooldownDuration = 4; // Cooldown of 4 ticks

    // If the cooldown has expired, update the player's cooldown time and return true
    if (currentTime - lastUse >= cooldownDuration) {
        cooldown[player.id] = currentTime;
        return true;
    }
    return false;
}

// Event handler for using an item on a block
world.beforeEvents.itemUseOn.subscribe((event) => {
    const player = world.getAllPlayers().find(v => v.id == event.source.id);
    if (event.source.typeId !== "minecraft:player" || !event.itemStack?.hasTag("kana_ca:wrench")) return;
    const block = event.block;
    const blockTypeId = block.typeId; // Use typeId to get the block's identifier
    if (!blockHasValidPropertiesNormal(block)) return;

    // Ensure the cooldown has expired before proceeding
    if (!hasCooldownExpired(player)) return;



    // Return if the block's typeId includes "smithing", "frame", or "vault"
    if (blockTypeId.includes("smithing") || blockTypeId.includes("frame") || blockTypeId.includes("shulker") || blockTypeId.includes("button") || blockTypeId.includes("crafting_table") || blockTypeId.includes("vault")) {
        return;
    }

    event.cancel = true; // Cancel default behavior

    const hasPropertiesNormal = blockHasValidPropertiesNormal(block);
    const hasPropertiesSneaking = blockHasValidPropertiesSneaking(block);

    // Delay by 5 ticks to check for the wrench and damage the item
    system.runTimeout(() => {
        if (isHoldingWrench(player) && hasPropertiesNormal || isHoldingWrench(player) && hasPropertiesSneaking) {
            const mainhand = player.getComponent('minecraft:equippable');
            const item = mainhand.getEquipment(EquipmentSlot.Mainhand);
            if (item && player.getGameMode() !== 'creative') damageItem(item, player);
        }
        player.playSound("break.heavy_core"); // Play a sound when the wrench is used
    }, 5);

    // If the player is sneaking, display block info; otherwise, modify the block's property
    // MODIFICADO
    if (!player.isSneaking && hasPropertiesNormal && !isExcludedBlockNormal(block)) {
        updateBlockPropertyNormal(player, block);
    }
    else if (player.isSneaking && hasPropertiesSneaking && !isExcludedBlockSneaking(block)) {
        updateBlockPropertySneaking(player, block);
    }
});

// Event handler for breaking a block
world.afterEvents.playerBreakBlock.subscribe((eventData) => {
    const player = eventData.player;
    const block = eventData.block;

    // If the player is holding a wrench and the block is not excluded, damage the wrench
    if (isHoldingWrench(player) && !isExcludedBlockNormal(block)) {
        const mainhand = player.getComponent('minecraft:equippable');
        const item = mainhand.getEquipment(EquipmentSlot.Mainhand);
        if (item) damageItem(item, player);
    }
});

// Function to update the block's selected property to the next valid value
function updateBlockPropertyNormal(player, block) {
    const permutation = block.permutation;
    const states = permutation.getAllStates();
    let names = Object.keys(states).filter(name => allowedStatesNormal.includes(name));

    // Exclude "facing_direction" for furnace-like blocks
    if (block.typeId.includes("furnace", "smoker", "chest", "observer")) {
        const index = names.indexOf("facing_direction");
        if (index > -1) names.splice(index, 1);
    }
    if (block.typeId.includes("hanging")) {
        const index = names.indexOf("ground_sign_direction");
        if (index > -1) names.splice(index, 1);
    }
    if (block.typeId.includes("lectern", "campfire", "anvil")) {
        const index = names.indexOf("direction");
        if (index > -1) names.splice(index, 1);
    }

    let prop = record[player.id];
    let val;

    if (!names.includes(prop)) prop = names[0];

    const isHopper = block.typeId === "minecraft:hopper";

    // Handle the special case for hoppers
    if (prop === "facing_direction") {
        if (isHopper && states[prop] === 0) {
            val = 2; // Set hopper facing down to face north
        } else {
            const valids = BlockStates.get(prop).validValues;
            val = valids[valids.indexOf(states[prop]) + 1];
            if (typeof val === "undefined") val = valids[0];
        }
    } else {
        // For other block states, cycle to the next valid value
        const valids = BlockStates.get(prop).validValues;
        val = valids[valids.indexOf(states[prop]) + 1];
        if (typeof val === "undefined") val = valids[0];
    }

    // Update the block with the new state value
    system.run(() => {
        block.setPermutation(permutation.withState(prop, val));
    });
}

// MODIFICADO
function updateBlockPropertySneaking(player, block) {
    const permutation = block.permutation;
    const states = permutation.getAllStates();
    let names = Object.keys(states).filter(name => allowedStatesSneaking.includes(name));

    let prop = record[player.id];
    let val;

    if (!names.includes(prop)) prop = names[0];

    if (block.typeId.includes("bell")) {
        return
    }
    else {
        // For other block states, cycle to the next valid value
        const valids = BlockStates.get(prop).validValues;
        val = valids[valids.indexOf(states[prop]) + 1];
        if (typeof val === "undefined") val = valids[0];
    }
    // Update the block with the new state value
    system.run(() => {
        block.setPermutation(permutation.withState(prop, val));
    });
}



// Checks if a block has any valid modifiable properties from the allowed states
function blockHasValidPropertiesNormal(block) {
    const states = block.permutation.getAllStates();
    return Object.keys(states).some(name => allowedStatesNormal.includes(name));
}
// MODIFICADO
function blockHasValidPropertiesSneaking(block) {
    const states = block.permutation.getAllStates();
    return Object.keys(states).some(name => allowedStatesSneaking.includes(name));
}
// Checks if a block is excluded from modification (e.g., banners, buttons, levers, and wall signs)
function isExcludedBlockNormal(block) {
    return block.typeId.includes("wall_banner") || block.typeId.includes("button") || block.typeId.includes("ladder") || block.typeId.includes("lever") || block.typeId.includes("wall_sign");
}
// MODIFICADO
function isExcludedBlockSneaking(block) {
    return block.typeId.includes("lectern") || block.typeId.includes("wall_banner") || block.typeId.includes("hanging") || block.typeId.includes("button") || block.typeId.includes("ladder") || block.typeId.includes("lever") || block.typeId.includes("wall_sign");
}