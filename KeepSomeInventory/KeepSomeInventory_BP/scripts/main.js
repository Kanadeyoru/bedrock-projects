import { world } from "@minecraft/server";

world.gameRules.keepInventory = true;

const checkArray = ["Head", "Chest", "Legs", "Feet", "Offhand"];

const ignoredItems = {
  ignoredItemsId: ["minecraft:elytra", "minecraft:shield"],
  ignoredItemsTag: [
    "minecraft:is_sword",
    "minecraft:diamond_tier",
    "minecraft:chainmail_tier",
    "minecraft:digger",
    "minecraft:golden_tier",
    "minecraft:horse_armor",
    "minecraft:iron_tier",
    "minecraft:is_armor",
    "minecraft:is_axe",
    "minecraft:is_hoe",
    "minecraft:is_pickaxe",
    "minecraft:is_shovel",
    "minecraft:is_tool",
    "minecraft:is_trident",
    "minecraft:leather_tier",
    "minecraft:netherite_tier",
    "minecraft:stone_tier",
    "minecraft:trimmable_armors",
    "minecraft:wooden_tier",
    "minecraft:is_shield",
  ],
};

function filterItems(items) {
  return items.filter(
    (item) =>
      item != null &&
      !ignoredItems.ignoredItemsTag.some((tag) => item.hasTag(tag)) &&
      !ignoredItems.ignoredItemsId.includes(item?.typeId) &&
      !item.keepOnDeath &&
      !validateVanishing(item)
  );
}

function validateVanishing(item) {
  const enchantable = item.getComponent("minecraft:enchantable");
  const hasVanishing = enchantable?.getEnchantment("vanishing")?.level;
  return hasVanishing > 0;
}

function getItemsFromEquippable(equippable) {
  return checkArray.map((slot) => equippable.getEquipment(slot));
}

function clearContainerItems(playerInventory) {
  for (let index = 0; index < playerInventory.size; index++) {
    const item = playerInventory.getItem(index);
    if (item != null) {
      const hasIgnoredTag = ignoredItems.ignoredItemsTag.some((tag) =>
        item.hasTag(tag)
      );
      if (
        validateVanishing(item) ||
        (!hasIgnoredTag &&
          !ignoredItems.ignoredItemsId.includes(item?.typeId) &&
          !item.keepOnDeath)
      ) {
        playerInventory.setItem(index, null);
      }
    }
  }
}

function clearEquippedItems(equippable) {
  checkArray.forEach((slot) => {
    const item = equippable.getEquipment(slot);
    if (item != null) {
      const hasIgnoredTag = ignoredItems.ignoredItemsTag.some((tag) =>
        item.hasTag(tag)
      );
      if (
        validateVanishing(item) ||
        (!hasIgnoredTag &&
          !ignoredItems.ignoredItemsId.includes(item?.typeId) &&
          !item.keepOnDeath)
      ) {
        equippable.setEquipment(slot, null);
      }
    }
  });
}

world.afterEvents.entityDie.subscribe(
  ({ deadEntity: player }) => {
    const { x, y, z } = player.location;
    const dimension = player.dimension;

    const playerInventory = player.getComponent(
      "minecraft:inventory"
    ).container;
    const equippable = player.getComponent("minecraft:equippable");

    let items = [];
    for (let slot = 0; slot < playerInventory.size; slot++) {
      items.push(playerInventory.getItem(slot));
    }
    items.push(...getItemsFromEquippable(equippable));

    items = filterItems(items);

    const angleStep = (2 * Math.PI) / items.length;
    items.forEach((item, index) => {
      try {
        const angle = index * angleStep;
        dimension.spawnItem(item, { x, y: y + 0.5, z });
      } catch (e) {
        console.error(`Error spawning item: ${e}`);
      }
    });

    clearContainerItems(playerInventory);
    clearEquippedItems(equippable);
  },
  { entityTypes: ["minecraft:player"] }
);
