import { world, BlockPermutation } from '@minecraft/server';

const hugeBlockData = {
    "kana_nto:thornstalk_bottom": {
        bottom: "kana_nto:thornstalk_bottom",
        middle: "kana_nto:thornstalk_middle",
        top: "kana_nto:thornstalk_top"
    }
};

world.beforeEvents.worldInitialize.subscribe((eventData) => {
    eventData.blockComponentRegistry.registerCustomComponent('kana_nto:pile_block', {

        onPlace(e) {
            const { block } = e;
            const blockMiddle = block.above();
            const blockTop = blockMiddle.above();

            if (!blockMiddle.isAir || !blockTop.isAir) {
                e.cancel = true;
                return;
            }

            const blockType = block.type.id;

            const blockData = hugeBlockData[blockType];
            if (blockData) {
                block.setType(blockData.bottom);
                blockMiddle.setType(blockData.middle);
                blockTop.setType(blockData.top);
            } else {
                console.error(`Error: Block ${blockType} is not registred inside hugeBlockData.`);
                e.cancel = true;
            }
        }
    });
});

function getPairedBlocks(blockID, block) {
    for (const blockType in hugeBlockData) {
        const blockData = hugeBlockData[blockType];

        if (blockID === blockData.bottom) {
            return [block, block.above(), block.above().above()];
        }
        if (blockID === blockData.middle) {
            const blockBottom = block.below();
            blockBottom.setType(blockData.top);
            return [block, block.above()];
        }
        if (blockID === blockData.top) {
            const blockMiddle = block.below();
            const blockBottom = blockMiddle.below();
            if (blockBottom && blockBottom.type.id === blockData.bottom) {
                blockMiddle.setType(blockData.top);
                blockBottom.setType(blockData.middle);
                return [block];
            }
            if (blockMiddle && blockMiddle.type.id === blockData.middle) {
                blockMiddle.setType(blockData.top);
                return [block];
            }
            return [block];
        }
    }
    return null;
}

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { brokenBlockPermutation, block } = event;
    const brokenBlockID = brokenBlockPermutation.type.id;

    const blocksToBreak = getPairedBlocks(brokenBlockID, block);
    if (blocksToBreak) {
        blocksToBreak.forEach(targetBlock => {
            targetBlock.setPermutation(BlockPermutation.resolve("air"));
        });
    }
});
