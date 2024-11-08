import { world } from "@minecraft/server"
import names from "./Names"
import surnames from "./Surnames"
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (entity?.typeId === "minecraft:piglin") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * surnames.length);
        entity.nameTag = names[firstNameIndex] + " " + surnames[lastNameIndex];
    } else if (entity?.typeId === "minecraft:piglin_brute") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * surnames.length);
        entity.nameTag = names[firstNameIndex] + " " + surnames[lastNameIndex];
    }
})
