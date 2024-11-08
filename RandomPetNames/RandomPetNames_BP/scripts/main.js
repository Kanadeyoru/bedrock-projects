import { world } from "@minecraft/server"
import names from "./Names"
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (entity.getComponent("minecraft:is_baby") != null && entity.getComponent("minecraft:is_tamed") != null) {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex];
    }
})
