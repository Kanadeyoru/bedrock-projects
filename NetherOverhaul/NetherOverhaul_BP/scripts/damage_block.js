import { world, EntityDamageCause } from '@minecraft/server';

const contactDamage = {
    onTick(event) {
        const block = event.block;
        const dimension = event.dimension;
        const damageVolume = { x: 0, y: -3, z: 0 }

        const entities = dimension.getEntities({
            location: block.location,
            volume: damageVolume
        });

        for (const entity of entities) {
            entity.applyDamage(1, {
                cause: EntityDamageCause.contact
            });
        }
    }
};

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "kana_nto:contact_damage",
        contactDamage
    );
});
