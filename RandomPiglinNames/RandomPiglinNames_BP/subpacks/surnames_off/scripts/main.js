import { world } from "@minecraft/server"
import names from "./Names"
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (entity?.typeId === "minecraft:piglin") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex];
    } else if (entity?.typeId === "minecraft:piglin_brute") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex];
    }
})
