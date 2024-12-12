import { world } from '@minecraft/server';

const lava_soaker_component = {
    onPlace(event) {
        const block = event.block;
        const { x, y, z } = block.location;

        const adjacentLavaBlocks = {
            north: block.north(),
            east: block.east(),
            south: block.south(),
            west: block.west(),
            above: block.above(),
            below: block.below()
        };

        const belowAdjacentLavaBlocks = {
            northBelow: block.north().below(),
            eastBelow: block.east().below(),
            southBelow: block.south().below(),
            westBelow: block.west().below()
        };

        const aboveAdjacentLavaBlocks = {
            northAbove: block.north().above(),
            eastAbove: block.east().above(),
            southAbove: block.south().above(),
            westAbove: block.west().above()
        };

        const isAdjacentToLava = [
            ...Object.values(adjacentLavaBlocks),
            ...Object.values(belowAdjacentLavaBlocks),
            ...Object.values(aboveAdjacentLavaBlocks)
        ].some(adjBlock =>
            adjBlock.typeId === "minecraft:lava" || adjBlock.typeId === "minecraft:flowing_lava"
        );

        if (block.typeId === "kana_nto:lava_soaker" && isAdjacentToLava) {
            block.setType("kana_nto:lava_soaker_molten");
            block.dimension.runCommandAsync(`fill ${x - 2} ${y - 2} ${z - 2} ${x + 2} ${y + 2} ${z + 2} minecraft:air [] replace minecraft:lava []`);
            block.dimension.runCommandAsync(`fill ${x - 2} ${y - 2} ${z - 2} ${x + 2} ${y + 2} ${z + 2} minecraft:air [] replace minecraft:flowing_lava []`);
        }
    }
};
const lava_soaker_molten_component = {
    onTick(event) {
        const dimension = event.dimension;
        const block = event.block;
        const { x, y, z } = block.location;
        const adjacentWaterBlocks = {
            north: block.north(),
            east: block.east(),
            south: block.south(),
            west: block.west(),
            above: block.above(),
            below: block.below()
        };
        const isAdjacentToWater = Object.values(adjacentWaterBlocks).some(adjBlock =>
            adjBlock.typeId === "minecraft:water" || adjBlock.typeId === "minecraft:flowing_water"
        );

        if (block.typeId === "kana_nto:lava_soaker_molten" && isAdjacentToWater) {
            block.setType("kana_nto:lava_soaker");
            block.dimension.spawnParticle("minecraft:cauldron_explosion_emitter", { x: x + 0.5, y: y + 0.75, z: z + 0.5 });
            dimension.playSound("random.fizz", block.location);
        }


    }
};
world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "kana_nto:lava_soaker_component",
        lava_soaker_component
    );
});
world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "kana_nto:lava_soaker_molten_component",
        lava_soaker_molten_component
    );
});
