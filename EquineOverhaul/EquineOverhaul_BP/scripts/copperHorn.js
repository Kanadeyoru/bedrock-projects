import { world, EquipmentSlot, EntityEquippableComponent, system, ItemDurabilityComponent } from "@minecraft/server";

const equines = [
	"minecraft:horse",
	"minecraft:mule",
	"minecraft:donkey"
];
const typeNames = {
	"minecraft:horse": "Horse",
	"minecraft:mule": "Mule",
	"minecraft:donkey": "Donkey"
};
function generateTag(entity, uniqueID) {
	return `name:${entity.nameTag || "???"}_type:${entity.typeId}_id:${uniqueID}`;
}
function getUniqueID() {
	const uniqueID = Math.floor(Math.random() * 10000);
	return uniqueID.toString().padStart(4, "0");
}
world.afterEvents.playerInteractWithEntity.subscribe((eventData) => {
	const player = eventData.player;
	const entity = eventData.target;
	const { x, y, z } = entity.location;

	const mainhand = player.getComponent(EntityEquippableComponent.componentId).getEquipmentSlot(EquipmentSlot.Mainhand);
	const item = mainhand?.getItem();

	if (!item || !mainhand?.hasTag("kana_eo:copper_horn") || !equines.includes(entity.typeId) || !entity.hasComponent("is_tamed")) return;

	system.run(() => {
		const uniqueID = getUniqueID();
		const friendlyType = typeNames[entity.typeId] || "Unknown";
		const tag = generateTag(entity, uniqueID);

		item.setLore([
			`Name: ${entity.nameTag || "???"}`,
			`Type: ${friendlyType}`,
			`ID: ${uniqueID}`
		]);
		mainhand.setItem(item);

		entity.addTag(tag);

		entity.dimension.playSound("mob.horse.idle", { x, y, z });
	});
});

world.afterEvents.itemUse.subscribe((eventData) => {
	const player = eventData.source;
	const itemStack = eventData.itemStack;
	const lore = itemStack?.getLore();

	if (!lore || lore.length < 3) return;

	const mainhand = player.getComponent(EntityEquippableComponent.componentId).getEquipmentSlot(EquipmentSlot.Mainhand);
	const item = mainhand.getItem();

	if (!mainhand?.hasTag("kana_eo:copper_horn") || player.getItemCooldown("copper_horn") > 0) return;

	const tag = `name:${lore[0].split(": ")[1]}_type:${Object.keys(typeNames).find(key => typeNames[key] === lore[1].split(": ")[1])}_id:${lore[2].split(": ")[1]}`;

	const entity = player.dimension.getEntities().find(entity => entity.hasTag(tag));

	if (entity) {
		entity.teleport(player.location);
		player.dimension.playSound("kana_eo:copper_horn", player.location);
	} else {
		console.warn("Couldn't find the entity (It is probably inside an unloaded chunk).");
	}

	mainhand.setItem(reduceDurability(player, itemStack, 1));
	itemStack.getComponent("cooldown").startCooldown(player);
	player.startItemCooldown("copper_horn", 140);
});

function reduceDurability(player, item, reduceAmount) {
	if (player.getGameMode() === "creative") return item;
	const comp = item.getComponent(ItemDurabilityComponent.componentId);
	if (!comp) return item;
	const reducedAmount = reduceAmount + comp.damage;
	if (reducedAmount >= comp.maxDurability) {
		world.playSound("random.break", player.location);
		return undefined;
	} else {
		comp.damage = reducedAmount;
		return item;
	}
}