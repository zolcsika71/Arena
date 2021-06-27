"use strict";

/*
 * To-do list: ====================
 * TODO: attack capability; calculations for how large of an invasion/defense group to make
 * TODO: small creep distraction cloud? would require manual pathfinding
 * TODO: consolidate bots
 *      TODO: this will go well with a major refactoring of room logic
 * TODO: safe mode trigger
 */

// Import everything needed
require("require");

// Main loop
module.exports.loop = function () {

    // Clear memory for non-existent creeps
    for (const name in Memory.creeps) {

        if (Game.creeps[name] == undefined) {

            delete Memory.creeps[name];

        }

    }
    // Animate each creep
    for (const name in Game.creeps) {

        Game.creeps[name].run();

    }
    // Animate each room
    for (const name in Game.rooms) {

        const room = Game.rooms[name],
            towers = room.find(
                FIND_MY_STRUCTURES,
                {"filter": (s) => s.structureType == STRUCTURE_TOWER}
            );

        for (const i in towers) {

            towers[i].run();

        }

    }
    // Animate each spawn
    for (const name in Game.spawns) {

        const spawn = Game.spawns[name];

        spawn.run();
        // Safe mode condition - spawn reaches 50% health
        if (spawn.hits < 0.5 * spawn.hitsMax) {

            spawn.room.controller.activateSafeMode();

        }

    }

};
