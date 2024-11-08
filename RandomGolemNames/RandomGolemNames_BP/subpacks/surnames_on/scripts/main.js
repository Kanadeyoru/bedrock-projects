import { world } from "@minecraft/server"
import names from "./Names"
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (entity?.typeId === "minecraft:iron_golem") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex] + " " + names[lastNameIndex];
    } else if (entity?.typeId === "minecraft:snow_golem") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex] + " " + names[lastNameIndex];
    } else if (entity?.typeId === "minecraft:ravager") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex] + " " + names[lastNameIndex];
    }
})
