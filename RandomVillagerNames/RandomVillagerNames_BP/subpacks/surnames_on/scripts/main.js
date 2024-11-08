import { world } from "@minecraft/server"
import names from "./Names"
import surnames from "./Surnames"
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (entity?.typeId === "minecraft:villager_v2") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * surnames.length);
        entity.nameTag = names[firstNameIndex] + " " + surnames[lastNameIndex];
    } else if (entity?.typeId === "minecraft:wandering_trader") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * surnames.length);
        entity.nameTag = names[firstNameIndex] + " " + surnames[lastNameIndex];
    } else if (entity?.typeId === "minecraft:pillager") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * surnames.length);
        entity.nameTag = names[firstNameIndex] + " " + surnames[lastNameIndex];
    } else if (entity?.typeId === "minecraft:vindicator") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * surnames.length);
        entity.nameTag = names[firstNameIndex] + " " + surnames[lastNameIndex];
    } else if (entity?.typeId === "minecraft:evocation_illager") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * surnames.length);
        entity.nameTag = names[firstNameIndex] + " " + surnames[lastNameIndex];
    } else if (entity?.typeId === "minecraft:witch") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * surnames.length);
        entity.nameTag = names[firstNameIndex] + " " + surnames[lastNameIndex];
    }
})
