// http://usejsdoc.org/

/**
 * The main global game object containing all the gameplay information. *
 * @class
 */
let Game = {

    /** TOWER **/

    /**
     * @constant
     * @type {number}
     */
    TOWER_CAPACITY: 50,
    /**
     * @constant
     * @type {number}
     */
    TOWER_COOLDOWN: 10,
    /**
     * @constant
     * @type {number}
     */
    TOWER_ENERGY_COST: 10,
    /**
     * @constant
     * @type {number}
     */
    TOWER_FALLOFF: 0.75,
    /**
     * @constant
     * @type {number}
     */
    TOWER_FALLOFF_RANGE: 20,
    /**
     * @constant
     * @type {number}
     */
    TOWER_HITS: 3000,
    /**
     * @constant
     * @type {number}
     */
    TOWER_OPTIMAL_RANGE: 5,
    /**
     * @constant
     * @type {number}
     */
    TOWER_POWER_ATTACK: 600,
    /**
     * @constant
     * @type {number}
     */
    TOWER_POWER_HEAL: 400,
    /**
     * @constant
     * @type {number}
     */
    TOWER_POWER_REPAIR: 800,
    /**
     * @constant
     * @type {number}
     */
    TOWER_RANGE: 50,



    /** TERRAIN TYPES **/

    /**
     * @constant
     * @type {number}
     */
    TERRAIN_WALL: 1,

    /**
     * @constant
     * @type {number}
     */
    TERRAIN_SWAMP: 2,

    /** ERROR CONSTANTS **/

    /**
     * @constant
     * @type {number}
     */
    OK: 0,

    /**
     * @constant
     * @type {number}
     */
    ERR_NOT_OWNER: -1,

    /**
     * @constant
     * @type {number}
     */
    ERR_NO_PATH: -2,

    /**
     * @constant
     * @type {number}
     */
    ERR_NAME_EXISTS: -3,

    /**
     * @constant
     * @type {number}
     */
    ERR_BUSY: -4,

    /**
     * @constant
     * @type {number}
     */
    ERR_NOT_FOUND: -5,

    /**
     * @constant
     * @type {number}
     */
    ERR_NOT_ENOUGH_ENERGY: -6,

    /**
     * @constant
     * @type {number}
     */
    ERR_NOT_ENOUGH_RESOURCES: -6,

    /**
     * @constant
     * @type {number}
     */
    ERR_NOT_ENOUGH_EXTENSIONS: -6,

    /**
     * @constant
     * @type {number}
     */
    ERR_INVALID_TARGET: -7,

    /**
     * @constant
     * @type {number}
     */
    ERR_FULL: -8,

    /**
     * @constant
     * @type {number}
     */
    ERR_NOT_IN_RANGE: -9,

    /**
     * @constant
     * @type {number}
     */
    ERR_INVALID_ARGS: -10,

    /**
     * @constant
     * @type {number}
     */
    ERR_TIRED: -11,

    /**
     * @constant
     * @type {number}
     */
    ERR_NO_BODYPART: -12,


    /** CREEP BODY PARTS **/

    /**
     * @constant
     * @type {string}
     */
     MOVE: "move",

    /**
     * @constant
     * @type {string}
     */
    WORK: "work",

    /**
     * @constant
     * @type {string}
     */
    CARRY: "carry",

    /**
     * @constant
     * @type {string}
     */
    ATTACK: "attack",

    /**
     * @constant
     * @type {string}
     */
    RANGED_ATTACK: "ranged_attack",

    /**
     * @constant
     * @type {string}
     */
    TOUGH: "tough",

    /**
     * @constant
     * @type {string}
     */
    HEAL: "heal",

    /**
     * @constant
     * @type {string}
     */
    CLAIM: "claim",

    /**
     * A hash containing all your construction sites with their id as hash keys.
     *
     */
    ConstructionSite: {},

    StructureContainer: {},

    StructureRampart: {},

    StructureRoad: {},

    StructureTower: {},

    /**
     * A hash containing all your creeps with creep names as hash keys.    *
     * */
    Creep: {},

    /**
     * A hash containing all your flags with flag names as hash keys.
     *
     * @see {@link http://support.screeps.com/hc/en-us/articles/203016382-Game#flags}
     * @type {Object.<string, Flag>}
     * @example
     * creep.moveTo(Game.flags.Flag1);
     */
    Flag: {},




    /**
     * A hash containing all your spawns with spawn names as hash keys.
     *
     * @see {@link http://support.screeps.com/hc/en-us/articles/203016382-Game#spawns}
     *
     * @type {Object.<string, StructureSpawn>}
     */
    StructureSpawn: {},

    /**
     * A hash containing all your structures with structure id as hash keys.
     *
     * @see {@link http://support.screeps.com/hc/en-us/articles/203016382-Game#structures}
     *
     * @type {Object.<string, Structure>}
     */
    Structure: {},

    /**
     * System game tick counter. It is automatically incremented on every tick.
     *
     * @see {@link http://support.screeps.com/hc/en-us/articles/203016382-Game#time}
     *
     * @type {number}
     */
    getTicks () {
    },

    /**
     * Get an object with the specified unique ID.
     * It may be a game object of any type.
     * Only objects from the rooms which are visible to you can be accessed.
     *
     * @see {@link http://support.screeps.com/hc/en-us/articles/203016382-Game#getObjectById}
     *
     * @type {function}
     *
     * @param {string} id The unique identificator.
     *
     * @return {object|null}
     */
    getObjectById(id) {
    },

    /**
     *
     * @param prototype
     */

    getObjectsByPrototype(prototype) {
    },

    getRange(from, to) {

    },
    /**
     * Get terrain type at the specified room position.
     *
     * @param {object} pos The position as an object containing x and y properties.
     *
     *
     * @return {number}
     */
    getTerrainAt (pos) {

    },

    getDirection() {

    }
};
