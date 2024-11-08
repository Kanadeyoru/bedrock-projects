import { world } from "@minecraft/server"
import names from "./Names"
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (entity?.typeId === "minecraft:cat") {
        let firstNameIndex = Math.floor(Math.random() * names.length);
        let lastNameIndex = Math.floor(Math.random() * names.length);
        entity.nameTag = names[firstNameIndex] + " " + names[lastNameIndex];
    }
})
