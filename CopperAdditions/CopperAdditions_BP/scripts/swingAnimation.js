import { world } from '@minecraft/server';

world.beforeEvents.worldInitialize.subscribe((blockComponentRegistry) => {
    blockComponentRegistry.itemComponentRegistry.registerCustomComponent("kana_ca:swing_animation", {
        onUseOn() { }
    });
});