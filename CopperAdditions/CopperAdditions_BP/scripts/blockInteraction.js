import { world, EquipmentSlot, EntityEquippableComponent, system, ItemDurabilityComponent, ItemStack } from '@minecraft/server';
import { entryBlocks } from './blocksList.js'

world.beforeEvents.itemUseOn.subscribe((eventData) => {
    const block = eventData.block;
    const player = eventData.source;
    const face = eventData.blockFace;
    const mainhand = player.getComponent(EntityEquippableComponent.componentId).getEquipmentSlot(EquipmentSlot.Mainhand);
    const item = mainhand.getItem();
    const { x, y, z } = block.location;

    entryBlocks.forEach((eBlock) => {
        if (block.typeId === eBlock.inputBlock && face !== "Down") {
            if (mainhand?.hasTag(eBlock.itemTag)) {
                system.run(() => {
                    block.setType(`${eBlock.outputBlock}`);
                    player.playSound(`${eBlock.interactionSound}`, { location: block });
                    block.dimension.spawnParticle(`${eBlock.interactionParticle}`, { x: x + 0.5, y: y + 0.75, z: z + 0.5 });
                    if (`${eBlock.itemType}` === "Durability") {
                        mainhand.setItem(reduceDurability(player, item, 1));
                    } else if (`${eBlock.itemType}` === "Stackable") {
                        mainhand.setItem(reduceStack(player, item));
                    } else return;
                })
            }
        }
    })
})

function reduceStack(player, item) {
    if (player.getGameMode() === "creative") return item;
    if (item.amount > 1) {
        item.amount -= 1;
        return item;
    } else {
        return undefined;
    }

}

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

