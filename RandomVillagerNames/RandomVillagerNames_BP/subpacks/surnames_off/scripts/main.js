import { world } from "@minecraft/server"
import names from "./Names"
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (entity?.typeId === "minecraft:villager_v2") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex];
    } else if (entity?.typeId === "minecraft:wandering_trader") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex];
    } else if (entity?.typeId === "minecraft:pillager") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex];
    } else if (entity?.typeId === "minecraft:vindicator") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex];
    } else if (entity?.typeId === "minecraft:evocation_illager") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex];
    } else if (entity?.typeId === "minecraft:witch") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex];
    }
})
