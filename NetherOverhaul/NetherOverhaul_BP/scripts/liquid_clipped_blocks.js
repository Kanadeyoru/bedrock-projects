import { world, EquipmentSlot, EntityEquippableComponent, system } from '@minecraft/server';

// Configuração inicial usando Map
const liquidClippedBlocks = new Map([
    [
        "kana_nto:lavalily", // Chave do mapa
        {
            blockID: "kana_nto:lavalily_block",
            blockItemID: "kana_nto:lavalily",
            liquidID: "minecraft:lava",
            placementSound: "dig.grass"
        }
    ]
]);

// Evento para manipular o uso de itens em blocos
world.beforeEvents.itemUseOn.subscribe((eventData) => {
    const block = eventData.block;
    const player = eventData.source;
    const mainhand = player.getComponent(EntityEquippableComponent.componentId).getEquipmentSlot(EquipmentSlot.Mainhand);
    const item = mainhand.getItem();
    const direction = getFacingDirection(player.getViewDirection());
    // Busca direta no Map pelo tipo do bloco atual
    const lcBlock = liquidClippedBlocks.get(item.typeId);

    // Se existir um bloco líquido correspondente e as condições forem atendidas
    if (lcBlock && block.above().isAir && mainhand?.hasTag(lcBlock.blockItemID)) {
        system.run(() => {
            const liquidSurface = block.above();

            // Configurações baseadas na direção do jogador
            liquidSurface.setType(lcBlock.blockID);
            const cardinalDirection = direction || "north"; // Direção padrão como norte
            liquidSurface.setPermutation(liquidSurface.permutation.withState("minecraft:cardinal_direction", cardinalDirection));

            player.playSound(lcBlock.placementSound, { location: block });
            mainhand.setItem(reduceStack(player, item));
        });
    }
});

// Reduz o item na mão do jogador (modo sobrevivência)
function reduceStack(player, item) {
    if (player.getGameMode() === "creative") return item;
    if (item.amount > 1) {
        item.amount -= 1;
        return item;
    } else {
        return undefined;
    }
}

// Calcula a direção para onde o jogador está olhando
function getFacingDirection(vector2) {
    let x = vector2.x;
    let z = vector2.z;

    if (Math.abs(z) > Math.abs(x)) {
        return z > 0 ? 'south' : 'north';
    } else {
        return x > 0 ? 'east' : 'west';
    }
}
