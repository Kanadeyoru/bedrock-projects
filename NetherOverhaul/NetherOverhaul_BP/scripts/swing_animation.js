import { world } from '@minecraft/server';

world.beforeEvents.worldInitialize.subscribe((blockComponentRegistry) => {
    blockComponentRegistry.itemComponentRegistry.registerCustomComponent("kanautils:swing_animation", {
        onUseOn() { }
    });
});