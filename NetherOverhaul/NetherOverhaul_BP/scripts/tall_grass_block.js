import { world, BlockPermutation } from '@minecraft/server';

const tallBlockMap = new Map([
    ["kana_nto:crimson_turf_bottom", "kana_nto:crimson_turf_top"],
]);

world.beforeEvents.worldInitialize.subscribe((eventData) => {
    eventData.blockComponentRegistry.registerCustomComponent('kana_nto:tall_grass', {
        beforeOnPlayerPlace(e) {
            const { block, permutationToPlace } = e;
            const blockAbove = block.above();

            if (!blockAbove.isAir) {
                e.cancel = true;
            }

            if (permutationToPlace.getState('minecraft:cardinal_direction')) {
                const blockRotation = permutationToPlace.getState('minecraft:cardinal_direction');
                blockAbove.setPermutation(BlockPermutation.resolve(
                    tallBlockMap.get(e.permutationToPlace.type.id),
                    { 'minecraft:cardinal_direction': blockRotation }
                ));
            } else {
                blockAbove.setPermutation(BlockPermutation.resolve(
                    tallBlockMap.get(e.permutationToPlace.type.id)
                ));
            }
        }
    });
});

function getPairedBlock(blockID) {
    if (tallBlockMap.has(blockID)) {
        return { pairedID: tallBlockMap.get(blockID), position: "above" };
    }

    for (let [bottom, top] of tallBlockMap.entries()) {
        if (top === blockID) {
            return { pairedID: bottom, position: "below" };
        }
    }
    return null;
}

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { brokenBlockPermutation, block } = event;
    const brokenBlockID = brokenBlockPermutation.type.id;

    const pairedBlock = getPairedBlock(brokenBlockID);
    if (pairedBlock) {
        const targetBlock = pairedBlock.position === "above" ? block.above() : block.below();
        targetBlock.setPermutation(BlockPermutation.resolve("air"));
    }
});
