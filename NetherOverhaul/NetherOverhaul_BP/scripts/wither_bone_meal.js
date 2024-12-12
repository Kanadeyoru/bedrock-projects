import { world, EquipmentSlot, EntityEquippableComponent, system } from '@minecraft/server';

world.beforeEvents.worldInitialize.subscribe((blockComponentRegistry) => {
    blockComponentRegistry.itemComponentRegistry.registerCustomComponent("kana_nto:swing_animation", {
        onUseOn() { }
    });
});

const vegetationBlocks = [
    "minecraft:short_grass",
    "minecraft:tall_grass",
    "minecraft:poppy",
    "minecraft:dandelion",
    "minecraft:blue_orchid",
    "minecraft:allium",
    "minecraft:azure_bluet",
    "minecraft:red_tulip",
    "minecraft:orange_tulip",
    "minecraft:white_tulip",
    "minecraft:pink_tulip",
    "minecraft:oxeye_daisy",
    "minecraft:sunflower",
    "minecraft:lilac",
    "minecraft:rose_bush",
    "minecraft:peony",
    "minecraft:large_fern",
    "minecraft:fern",
    "minecraft:cornflower",
    "minecraft:lily_of_the_valley",
    "minecraft:crimson_fungus",
    "minecraft:brown_mushroom",
    "minecraft:red_mushroom",
    "minecraft:warped_fungus",
    "minecraft:crimson_roots",
    "minecraft:warped_roots",
    "minecraft:nether_sprouts",
    "minecraft:azalea",
    "minecraft:flowering_azalea",
    "minecraft:spore_blossom",
    "kana_nto:crimson_turf",
    "kana_nto:crimson_sprouts"
];

world.beforeEvents.itemUseOn.subscribe((eventData) => {
    const block = eventData.block;
    const player = eventData.source;
    const face = eventData.blockFace;
    const mainhand = player.getComponent(EntityEquippableComponent.componentId).getEquipmentSlot(EquipmentSlot.Mainhand);
    const item = mainhand.getItem();
    const { x, y, z } = block.location;

    if ((block.typeId === "minecraft:grass_block" && face !== "Down") || vegetationBlocks.includes(block.typeId)) {
        if (mainhand?.hasTag("kana_nto:wither_bone_meal")) {
            system.run(() => {
                // Reduz a pilha de itens
                mainhand.setItem(reduceStack(player, item));
                player.playSound("item.bone_meal.use", { location: block, pitch: 0.5 });

                // Substitui os blocos de vegetação ao redor
                replaceVegetationBlocksNearBlock(block, vegetationBlocks); // 3 é o raio (ajuste conforme necessário)


            });
        }
    }
});

function replaceVegetationBlocksNearBlock(block, vegetationBlocks) {
    try {
        const dimension = block.dimension;

        // Coordenadas iniciais para a busca com raio fixo (3×2×3)
        const radiusX = 2; // 3 blocos em cada direção no eixo X
        const radiusY = 2; // 2 blocos em cada direção no eixo Y
        const radiusZ = 2; // 3 blocos em cada direção no eixo Z

        const x0 = block.location.x - radiusX;
        const y0 = block.location.y - radiusY;
        const z0 = block.location.z - radiusZ;
        const xMax = block.location.x + radiusX;
        const yMax = block.location.y + radiusY;
        const zMax = block.location.z + radiusZ;

        for (let x = x0; x <= xMax; x++) {
            for (let z = z0; z <= zMax; z++) {
                const chance = Math.random();

                if (chance >= 0.7) {
                    dimension.spawnParticle("minecraft:wither_boss_invulnerable", { x: x + 0.5, y: block.location.y + 1.5, z: z + 0.5 });
                }

                for (let y = y0; y <= yMax; y++) {
                    const currentBlock = dimension.getBlock({ x, y, z });

                    if (vegetationBlocks.includes(currentBlock.typeId)) {
                        currentBlock.setType("minecraft:air");
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}

function reduceStack(player, item) {
    if (player.getGameMode() === "creative") return item;
    if (item.amount > 1) {
        item.amount -= 1;
        return item;
    } else {
        return undefined;
    }
}