import { world, EquipmentSlot, EntityEquippableComponent, system, ItemDurabilityComponent, ItemStack } from '@minecraft/server';

world.beforeEvents.itemUseOn.subscribe((eventData) => {
    const block = eventData.block;
    const player = eventData.source;
    const mainhand = player.getComponent(EntityEquippableComponent.componentId).getEquipmentSlot(EquipmentSlot.Mainhand);
    const item = mainhand.getItem();
    const { x, y, z } = block.location;

    if (mainhand?.hasTag("kana_cb:cloud_bucket")) {
        system.run(() => {
            block.dimension.playSound("dig.cloth", { x: x, y: y, z: z });
            mainhand.setItem(reduceDurability(player, item, 1));
        })
    }
})

const delete_after_tick = {
    onTick(event) {
        const block = event.block;
        const { x, y, z } = block.location;
        block.setType("minecraft:air")
        block.dimension.playSound("dig.cloth", { x: x, y: y, z: z });
        block.dimension.spawnParticle("kana_cb:cloud_particle", { x: x + 0.5, y: y + 0.75, z: z + 0.5 });
    }
};

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "kana_cb:delete_after_tick",
        delete_after_tick
    );
});

function reduceDurability(player, item, reduceAmount) {
    const bucket = new ItemStack("minecraft:bucket");
    if (player.getGameMode() === "creative") return item;
    const comp = item.getComponent(ItemDurabilityComponent.componentId);
    if (!comp) return item;
    const reducedAmount = reduceAmount + comp.damage;
    if (reducedAmount >= comp.maxDurability) {
        return bucket;
    } else {
        comp.damage = reducedAmount;
        return item;
    }
}