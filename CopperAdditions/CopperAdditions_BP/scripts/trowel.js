import { world, system } from "@minecraft/server";

const playerData = new Map();
const eventQueue = [];
const playerInventory = new Map();



world.beforeEvents.itemUseOn.subscribe((event) => {
    if (event.source.typeId !== "minecraft:player" || !event.itemStack?.hasTag("kana_ca:trowel")) return;
    eventQueue.push(event);

});


function processQueue() {
    while (eventQueue.length > 0) {
        const event = eventQueue.shift();
        handleItemUseOn(event);
    }
    system.runTimeout(processQueue, 1);
}

function handleItemUseOn(event) {
    const player = event.source;
    const inventory = player.getComponent("inventory");
    const item = event.itemStack;
    const slotIndex = player.selectedSlotIndex;

    const data = playerData.get(player) || {};
    const currentTime = Date.now();

    if (!data.lastPlaceTime) data.lastPlaceTime = 0;
    if (!data.lastShiftPlaceTime) data.lastShiftPlaceTime = 0;

    data.clickedBlockLocation = {
        x: event.block.location.x,
        y: event.block.location.y,
        z: event.block.location.z,
    };
    data.clickedBlockFace = event.blockFace;
    playerData.set(player, data);

    if (event.source.typeId !== "minecraft:player" || !event.itemStack?.hasTag("kana_ca:trowel")) return;

    if (hasInventoryChanged(player)) {
        updateHotbarAndBlockItems(player, inventory, data);
    }

    if (data.blockItems.size === 0) return;

    const randomIndex = Math.floor(Math.random() * data.blockItems.size);
    const selectedSlot = Array.from(data.blockItems.keys())[randomIndex];
    const selectedBlock = data.blockItems.get(selectedSlot);

    let newBlockLocation = calculateNewBlockLocation(data);

    try {
        const newBlock = player.dimension.getBlock(newBlockLocation);
        if (newBlock && newBlock.typeId === "minecraft:air" && currentTime - data.lastPlaceTime > 100) {
            newBlock.setType(selectedBlock.typeId);
            if (player.getGameMode() !== "creative") {
                applyDurabilityDamage(player, item, inventory, slotIndex);
            };
            data.lastPlaceTime = currentTime;
            updateInventoryAfterPlacement(player, inventory, selectedSlot, selectedBlock, data);
        }
    } catch (error) {
    }

    data.clickedBlockLocation = null;
    data.clickedBlockFace = null;
    playerData.set(player, data);
}

function snapshotPlayerInventory(player) {
    const inventory = player.getComponent('inventory');
    const inventorySnapshot = new Map();
    for (let i = 0; i < inventory.container.size; i++) {
        const item = inventory.container.getItem(i);
        inventorySnapshot.set(i, item ? item.typeId : null);
    }
    playerInventory.set(player, inventorySnapshot);
}

function hasInventoryChanged(player) {
    const inventory = player.getComponent('inventory').container;
    const previousSnapshot = playerInventory.get(player);
    const data = playerData.get(player) || {};
    if (!previousSnapshot) {
        snapshotPlayerInventory(player);
        return true;
    }

    for (let i = 0; i < inventory.size; i++) {
        const currentItem = inventory.getItem(i);
        const selectedBlock = data.blockItems.amount;
        const currentItemTypeId = currentItem ? currentItem.typeId : null;
        if (previousSnapshot.get(i) !== currentItemTypeId || previousSnapshot.get(i) !== selectedBlock) {
            snapshotPlayerInventory(player);
            return true;
        }
    }
    return false;
}

function updateHotbarAndBlockItems(player, inventory, data) {
    const currentHotbar = new Map();
    data.blockItems = new Map();

    for (let i = 0; i < 9; i++) {
        const invItem = inventory.container.getItem(i);
        const typeId = invItem ? invItem.typeId : null;
        currentHotbar.set(i, typeId);

        if (invItem && typeId) {
            try {
                // Check if the item has a destructible_by_mining component
                const hasDestructibleByMining = invItem.getComponent('minecraft:destructible_by_mining') !== null;

                if (hasDestructibleByMining && !typeId.includes("shulker")) {
                    data.blockItems.set(i, invItem);
                }
            } catch (error) {
                console.warn(`Error checking item type for ${typeId}: ${error}`);
            }
        }
    }

    data.cachedHotbar = currentHotbar;
    snapshotPlayerInventory(player); // Update snapshot after changes
}

function calculateNewBlockLocation(data) {
    let newBlockLocation = { ...data.clickedBlockLocation };

    switch (data.clickedBlockFace.toLowerCase()) {
        case "west": newBlockLocation.x--; break;
        case "east": newBlockLocation.x++; break;
        case "down": newBlockLocation.y--; break;
        case "up": newBlockLocation.y++; break;
        case "north": newBlockLocation.z--; break;
        case "south": newBlockLocation.z++; break;
        default: console.warn(`Unrecognized face: ${data.clickedBlockFace}`);
    }

    return newBlockLocation;
}

function updateInventoryAfterPlacement(player, inventory, selectedSlot, selectedBlock, data) {
    const currentStack = selectedBlock.amount;
    if (player.getGameMode() === "creative") return;
    if (currentStack > 1) {
        selectedBlock.amount = currentStack - 1;
        inventory.container.setItem(selectedSlot, selectedBlock);
    } else {
        let foundReplacement = false;
        for (let i = 9; i < inventory.container.size; i++) {
            const invItem = inventory.container.getItem(i);
            if (invItem && invItem.typeId === selectedBlock.typeId) {
                const transferAmount = invItem.amount;
                selectedBlock.amount = transferAmount;
                inventory.container.setItem(selectedSlot, selectedBlock);
                inventory.container.setItem(i, undefined);
                foundReplacement = true;
                break;
            }
        }
        if (!foundReplacement) {
            inventory.container.setItem(selectedSlot, undefined);
            data.blockItems.delete(selectedSlot);
        }
    }
    snapshotPlayerInventory(player);
}

processQueue();

function getRelevantEnchantments(item) {
    let unbreakingLevel = 0;

    try {
        const enchantableComponent = item.getComponent("minecraft:enchantable");
        if (enchantableComponent) {
            const enchantments = enchantableComponent.getEnchantments();
            for (const enchant of enchantments) {
                if (enchant.type.id === "unbreaking") {
                    unbreakingLevel = enchant.level;
                }
            }
        }
    } catch (error) {
    }
    return { unbreakingLevel };
}

function applyDurabilityDamage(player, item, inventory, slotIndex) {
    const durabilityComponent = item.getComponent("minecraft:durability");
    if (durabilityComponent) {
        const { unbreakingLevel } = getRelevantEnchantments(item);

        if (Math.random() < 1 / (unbreakingLevel + 1)) {
            const newDamage = durabilityComponent.damage + 1;
            if (newDamage >= durabilityComponent.maxDurability) {
                inventory.container.setItem(slotIndex, undefined);
                player.playSound("random.break");
            } else {
                durabilityComponent.damage = newDamage;
                inventory.container.setItem(slotIndex, item);
            }
        }
    }
}