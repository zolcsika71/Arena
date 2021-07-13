// Room brain: processes tasks from room and requests from worker body
var tasks = require("./tasks");
var roles = require("./roles");
var flagCodes = require("./map_flag_codes");

class RoomBrain {

    constructor (roomName) {

        this.name = roomName;
        this.room = Game.rooms[roomName];
        this.spawn = _.filter(
            this.room.spawns,
            (spawn) => !spawn.spawning
        )[0];
        this.incubating = _.filter(
            this.room.flags,
            flagCodes.territory.claimAndIncubate.filter
        ).length > 0;
        // Settings shared across all rooms
        this.settings = {
            "fortifyLevel": 1e+6, // Fortify wall HP
            "workerPatternRepetitionLimit": 10, // Maximum number of body repetitions for workers
            "maxWorkersPerRoom": 2, // Maximum number of workers to Spawn per room based on number of required jobs
            "incubationWorkersToSend": 3, // Number of big workers to send to incubate a room
            "supplierPatternRepetitionLimit": 4, // Maximum number of body repetitions for suppliers
            "haulerPatternRepetitionLimit": 7, // Maximum number of body repetitions for haulers
            "remoteHaulerPatternRepetitionLimit": 8, // Maximum number of body repetitions for haulers
            "minersPerSource": 1, // Number of miners to assign to a source
            "storageBuffer": { // Creeps of a given role can't withdraw from (or not deposit to) storage until this level
                "linker": 75000, // Linker must deposit to storage below this amount
                "worker": 50000,
                "upgrader": 75000,
                "default": 0
            },
            "unloadStorageBuffer": 750000, // Start sending energy to other rooms past this amount
            "reserveBuffer": 3000, // Reserve rooms to this amount
            "maxAssistLifetimePercentage": 0.1 // Assist in Spawn operations up to (creep.lifetime * this amount) distance
        };
        if (this.room.controller) {

            this.settings.fortifyLevel = Math.min(
                10 ** Math.max(
                    this.room.controller.level,
                    3
                ),
                1e+6
            );

        }
        // Settings for new rooms that are being incubated
        this.incubatingSettings = {
            "fortifyLevel": 1e+4, // Fortify all walls/ramparts to this level
            "workerPatternRepetitionLimit": 10, // Maximum number of body repetitions for workers
            "maxWorkersPerRoom": 3, // Maximum number of workers to Spawn per room based on number of required jobs
            "supplierPatternRepetitionLimit": 4, // Maximum number of body repetitions for suppliers
            "haulerPatternRepetitionLimit": 7, // Maximum number of body repetitions for haulers
            "remoteHaulerPatternRepetitionLimit": 8, // Maximum number of body repetitions for haulers
            "minersPerSource": 1, // Number of miners to assign to a source
            "storageBuffer": { // Creeps of a given role can't withdraw from storage until this level
                "worker": 1000,
                "upgrader": 5000,
                "default": 0
            },
            "reserveBuffer": 3000 // Reserve rooms to this amount
        };
        if (this.incubating) {

            this.settings = this.incubatingSettings; // Overwrite settings for incubating rooms

        }
        // Settings to override this.settings for a particular room
        this.override = {
            "workersPerRoom": { // Custom number of workers per room
                /*
                 * "W18N88": 2,
                 * "W19N88": 5,
                 */
            },
            "fortifyLevel": {
                // "W18N88": 2e+6
            } // Fortify all walls/ramparts to these levels in these rooms
        };

        // Task priorities - the actual priority the tasks are given. Everything else depends on this order
        this.taskPriorities = [
            "supplyTowers",
            "supply",
            "pickup",
            "collect",
            "repair",
            "build",
            "buildRoads",
            "fortify",
            "upgrade"
        ];
        // Tasks to execute for each prioritized task
        this.taskToExecute = {
            "pickup": "pickup",
            "collect": "recharge",
            "supplyTowers": "supply",
            "supply": "supply",
            "repair": "repair",
            "build": "build",
            "buildRoads": "build",
            "fortify": "fortify",
            "upgrade": "upgrade"
        };
        // Task role conditions
        this.assignmentRoles = {
            "pickup": [], // ['supplier', 'hauler'],
            "collect": ["hauler"],
            "supplyTowers": [
                "supplier",
                "hauler"
            ],
            "supply": [
                "supplier",
                "hauler"
            ],
            "repair": [
                "worker",
                "miner",
                "guard"
            ],
            "build": [
                "worker",
                "miner"
            ],
            "buildRoads": [
                "worker",
                "guard"
            ],
            "fortify": ["worker"],
            "upgrade": [
                "worker",
                "upgrader"
            ]
        };
        if (this.room.controller && this.room.controller.level == 8) { // Workers shouldn't upgrade at GCL 8; only upgraders

            this.assignmentRoles.upgrade = ["upgrader"];

        }
        // Task assignment conditions
        this.assignmentConditions = {
            "pickup": (creep) => creep.getActiveBodyparts(CARRY) > 0 && creep.carry.energy < creep.carryCapacity,
            "collect": (creep) => creep.getActiveBodyparts(CARRY) > 0 && creep.carry.energy < creep.carryCapacity,
            "supplyTowers": (creep) => creep.getActiveBodyparts(CARRY) > 0 && creep.carry.energy > 0,
            "supply": (creep) => creep.getActiveBodyparts(CARRY) > 0 && creep.carry.energy > 0,
            "repair": (creep) => creep.getActiveBodyparts(WORK) > 0 && creep.carry.energy > 0,
            "build": (creep) => creep.getActiveBodyparts(WORK) > 0 && creep.carry.energy > 0,
            "buildRoads": (creep) => creep.getActiveBodyparts(WORK) > 0 && creep.carry.energy > 0,
            "fortify": (creep) => creep.getActiveBodyparts(WORK) > 0 && creep.carry.energy > 0,
            "upgrade": (creep) => creep.getActiveBodyparts(WORK) > 0 && creep.carry.energy > 0
        };

    }

    get memory () {

        if (!Memory.roomBrain[this.name]) {

            Memory.roomBrain[this.name] = {};

        }

        return Memory.roomBrain[this.name];

    }

    /*
     * Get localSpawnQueue() {
     *     If (!this.memory.spawnQueue) {
     *         This.memory.spawnQueue = {};
     *     }
     *     Return this.memory.spawnQueue;
     * }
     *
     * Get globalSpawnQueue() {
     *     If (!Memory.globalSpawnQueue) {
     *         Memory.globalSpawnQueue = {};
     *     }
     *     Return Memory.globalSpawnQueue;
     * }
     */

    log (message) {

        console.log(`${this.name}_Brain: "${message}"`);

    }


    // Creep task assignment ===========================================================================================

    getTasks (taskType) {

        let targets = [];

        switch (taskType) {

        case "pickup": // Pick up energy
            targets = this.room.find(
                FIND_DROPPED_RESOURCES,
                {"filter": (drop) => drop.amount > 100}
            );
            break;
        case "collect": // Collect from containers
            targets = _.filter(
                this.room.containers,
                (container) => container.store[RESOURCE_ENERGY] > 1000
            );
            break;
        case "supplyTowers": // Find towers in need of energy
            targets = _.filter(
                this.room.towers,
                (tower) => tower.energy < tower.energyCapacity
            );
            break;
        case "supply": // Find structures in need of energy
            targets = _.filter(
                this.room.sinks,
                (structure) => structure.energy < structure.energyCapacity
            );
            break;
        case "repair": // Repair structures
            targets = _.filter(
                this.room.repairables,
                (s) => s.hits < s.hitsMax &&
						(s.structureType != STRUCTURE_CONTAINER || s.hits < 0.7 * s.hitsMax) &&
						(s.structureType != STRUCTURE_ROAD || s.hits < 0.7 * s.hitsMax)
            );
            break;
        case "build": // Build construction jobs
            targets = this.room.structureSites;
            break;
        case "buildRoads": // Build construction jobs
            targets = this.room.roadSites;
            break;
        case "fortify": // Fortify walls
            var {fortifyLevel} = this.settings; // global fortify level

            if (this.override.fortifyLevel[this.room.name]) {

                fortifyLevel = this.override.fortifyLevel[this.room.name]; // Override for certain rooms

            }
            // Noinspection JSReferencingMutableVariableFromClosure
            targets = _.filter(
                this.room.barriers,
                (s) => s.hits < fortifyLevel
            );
            break;
        case "upgrade": // Upgrade controller
            if (this.room.controller && this.room.controller.my) {

                targets = [this.room.controller];

            }
            break;

        }

        return targets;

    }

    getMostUrgentTask (tasksToGet) {

        for (const taskType of tasksToGet) {

            var targets = this.getTasks(taskType),
			 taskToExecute = tasks(this.taskToExecute[taskType]); // Create task object
            // Ignore targets that are already targeted by too many creeps

            targets = _.filter(
                targets,
                (target) => target != null &&
				target.targetedBy.length < taskToExecute.maxPerTarget
            );
            if (targets.length > 0) { // Return on the first instance of a target being found

                return [
                    taskToExecute,
                    targets
                ];

            }

        }

        return [
            null,
            null
        ];

    }

    assignTask (creep) {

        let applicableTasks = _.filter(
                this.taskPriorities,
                (task) => this.assignmentRoles[task].includes(creep.memory.role) &&
				this.assignmentConditions[task](creep)
            ),
		 [
                task,
                targets
            ] = this.getMostUrgentTask(applicableTasks);
        // Assign the task


        if (targets != null) { // TODO: is this null check necessary?

            let target;

            if (task.name == "fortify") {

                target = _.sortBy(
                    targets,
                    (target) => target.hits
                )[0]; // Fortification should target lowest HP barrier

            } else if (creep.room == this.room) {

                target = creep.pos.findClosestByRange(targets);

            } else {

                target = targets[0];

            }
            if (target) {

                return creep.assign(
                    task,
                    target
                );

            }

        }

        return null;

    }


    // Creep quantity and size requirements ============================================================================

    calculateWorkerRequirementsByEnergy () {

        // Calculate needed numbers of workers from an energetics standpoint
        const {spawn} = this;

        if (spawn) {

            if (this.override.workersPerRoom[this.name]) {

                return this.override.workersPerRoom[this.name];

            }
            let energy = this.room.energyCapacityAvailable,
			 workerBodyPattern = roles("worker").settings.bodyPattern,
			 workerSize = Math.min(
                    Math.floor(energy / spawn.cost(workerBodyPattern)),
                    this.settings.workerPatternRepetitionLimit
                ),
			 equilibriumEnergyPerTick = workerSize;

            if (this.room.storage == undefined) {

                equilibriumEnergyPerTick /= 1.5; // Workers spend a lot of time walking around if there's not storage

            }
            const sourceEnergyPerTick = 3000 / 300 * this.room.sources.length;


            return Math.ceil(0.8 * sourceEnergyPerTick / equilibriumEnergyPerTick); // Operate under capacity limit

        }

        return null;

    }

    calculateWorkerRequirementsByJobs () { // TODO: replace from number of jobs to total time of jobs

        /*
         * Calculate needed number of workers based on number of jobs present; used at >=RCL5
         * Repair jobs - custom calculated; workers should Spawn once several repairs are needed to roads
         */
        const numRepairJobs = _.filter(
                this.room.repairables,
                (s) => s.hits < s.hitsMax &&
				(s.structureType != STRUCTURE_ROAD || s.hits < 0.5 * s.hitsMax)
            ).length,
            // Construction jobs
		 numConstructionJobs = this.getTasks("build").length + this.getTasks("buildRoads").length,
            // Fortify jobs
		 numFortifyJobs = this.getTasks("fortify").length,
		 numJobs = numRepairJobs + numConstructionJobs + numFortifyJobs;

        if (numJobs == 0) {

            return 0;

        }

        const workerBodyPattern = roles("worker").settings.bodyPattern,
			 workerSize = Math.min(
                Math.floor(this.room.energyCapacityAvailable / this.spawn.cost(workerBodyPattern)),
                this.settings.workerPatternRepetitionLimit
            );


        return Math.min(
            Math.ceil(2 / workerSize * numJobs),
            this.settings.maxWorkersPerRoom
        );

    }

    calculateHaulerSize (target, remote = false) { // Required hauler size to fully saturate a source given distance

        let haulerBodyPattern = roles("hauler").settings.bodyPattern,
		 tripLength; // Total round-trip distance, assuming full speed

        if (!remote) {

            tripLength = 2 * target.pathLengthToStorage;

        } else {

            tripLength = 2 * target.pathLengthToAssignedRoomStorage;

        }
        const carryPartsPerRepetition = _.filter(
                haulerBodyPattern,
                (part) => part == CARRY
            ).length, // Carry parts
		 energyPerTripPerRepetition = 50 * carryPartsPerRepetition, // Energy per trip per repetition of body pattern
		 energyPerTickPerRepetition = energyPerTripPerRepetition / tripLength, // Energy per tick per repetition
		 sourceEnergyPerTick = 3000 / 300,
            sizeRequiredForEquilibrium = sourceEnergyPerTick / energyPerTickPerRepetition; // Size a hauler needs to be


        return Math.ceil(1.1 * sizeRequiredForEquilibrium); // Slightly overestimate

    }

    calculateHaulerRequirements (target, remote = false) {

        // Calculate needed numbers of haulers for a source
        const {spawn} = this;

        if (spawn && this.room && this.room.storage) {

            if (target.linked && this.room.storage.linked) { // Don't send haulers to linked sources

                return [
                    null,
                    null
                ];

            }
            let haulerBodyPattern = roles("hauler").settings.bodyPattern,
			 haulerSize = this.calculateHaulerSize(
                    target,
                    remote
                ), // Calculate required hauler size
			 numHaulers = 1, // 1 hauler unless it's too large
			 maxHaulerSize = Math.min(
                    Math.floor(this.room.energyCapacityAvailable / spawn.cost(haulerBodyPattern)),
                    50 / haulerBodyPattern.length
                );

            if (haulerSize > maxHaulerSize) { // If hauler is too big, adjust size to max and number accordingly

                numHaulers = haulerSize / maxHaulerSize; // Amount needed
                haulerSize = Math.ceil(maxHaulerSize * (numHaulers / Math.ceil(numHaulers))); // Chop off excess
                numHaulers = Math.ceil(numHaulers); // Amount -> integer

            }

            return [
                haulerSize,
                numHaulers
            ];

        }

        return [
            null,
            null
        ];

    }

    calculateRemoteHaulingRequirements () {

        const miningFlags = _.filter(
                this.room.assignedFlags,
                flagCodes.industry.remoteMine.filter
            ),
		 haulingNeeded = _.sum(_.map(
                miningFlags,
                (flag) => flag.haulingNeeded
            ));


        return haulingNeeded * 1.2; // Add a bit of excess to account for inefficiencies

    }


    // Core creep spawning operations ==================================================================================

    handleMiners () {

        if (this.incubating) {

            return null; // Don't make your own miners during incubation or at super low levels

        }
        const {sources} = this.room; // Don't use ACTIVE_SOURCES; need to always be handled

        for (const source of sources) {

            /*
             * TODO: calculation of number of miners to assign to each source based on max size of creep
             * Check enough miners are supplied
             */
            const assignedMiners = source.getAssignedCreepAmounts("miner");

            if (assignedMiners < this.settings.minersPerSource) {

                return roles("miner").create(
                    this.spawn,
                    {
                        "assignment": source,
                        "workRoom": this.room.name
                    }
                );

            }

        }

        return null;

    }

    handleHaulers () {

        // Check enough haulers are supplied
        if (this.room.storage != undefined) { // Haulers are only built once a room has storage

            /*
             * Find all unlinked sources
             * Var sources = this.room.find(FIND_SOURCES, {
             *     Filter: source => source.linked == false || this.room.storage.linked == false
             * });
             */
            const sources = _.filter(
                this.room.sources,
                (s) => s.linked == false || this.room.storage.linked == false
            );

            for (const source of sources) {

                // Check enough haulers are supplied if applicable
                const assignedHaulers = source.getAssignedCreepAmounts("hauler"),
                    [
                        haulerSize,
                        numHaulers
                    ] = this.calculateHaulerRequirements(source);

                if (assignedHaulers < numHaulers) {

                    return roles("hauler").create(
                        this.spawn,
                        {
                            "assignment": source,
                            "workRoom": this.room.name,
                            "patternRepetitionLimit": haulerSize
                        }
                    );

                }

            }

        }

        return null;

    }

    handleLinkers () {

        // Check enough haulers are supplied
        if (this.room.storage != undefined && this.room.storage.linked) { // Linkers only for storage with links

            if (this.room.storage.getAssignedCreepAmounts("linker") < 1) {

                return roles("linker").create(
                    this.spawn,
                    {
                        "assignment": this.room.storage,
                        "workRoom": this.room.name,
                        "patternRepetitionLimit": 8
                    }
                );

            }

        }

        return null;

    }

    handleMineralSuppliers () {

        // Check enough haulers are supplied
        if (this.room.terminal != undefined && this.room.labs.length > 0) {

            if (this.room.terminal.getAssignedCreepAmounts("mineralSupplier") < 1) {

                return roles("mineralSupplier").create(
                    this.spawn,
                    {
                        "assignment": this.room.terminal,
                        "workRoom": this.room.name,
                        "patternRepetitionLimit": 1
                    }
                );

            }

        }

        return null;

    }

    handleSuppliers () {

        // Handle suppliers
        const numSuppliers = this.room.controller.getAssignedCreepAmounts("supplier"),

            /*
             * Var energySinks = this.room.find(FIND_STRUCTURES, {
             *     Filter: (structure) => (structure.structureType == STRUCTURE_TOWER ||
             *                             Structure.structureType == STRUCTURE_EXTENSION ||
             *                             Structure.structureType == STRUCTURE_SPAWN)
             * });
             */
		 numEnergySinks = this.room.sinks.length + this.room.towers.length,
		 {storageUnits} = this.room;

        if (numEnergySinks <= 1) { // If there's just a spawner in the room, like in RCL1 rooms

            return null;

        }
        let supplierLimit = 2, // There must always be at least one supplier in the room
            /*
             * If (_.filter(energySinks, s => s.energy < s.energyCapacity).length > 0) {
             *     SupplierLimit += 1;
             * }
             */
		 expensiveFlags = _.filter(
                this.room.assignedFlags,
                (flag) => flagCodes.millitary.filter(flag) ||
			flagCodes.destroy.filter(flag) ||
			flagCodes.industry.filter(flag) ||
			flagCodes.territory.filter(flag)
            );

        supplierLimit += Math.floor(expensiveFlags.length / 10); // Add more suppliers for cases of lots of flags // TODO: better metric
        let supplierSize;

        if (numSuppliers == 0) { // In case the room runs out of suppliers at low energy

            /*
             * SupplierSize = Math.min(this.settings.supplierPatternRepetitionLimit,
             *                         This.room.energyAvailable / roles('supplier').bodyCost(
             *                             Roles('supplier').settings.bodyPattern));
             */
            supplierSize = 1;
            // This.log(supplierSize)

        } else {

            supplierSize = this.settings.supplierPatternRepetitionLimit;

        }
        if (numSuppliers < supplierLimit) {

            return roles("supplier").create(
                this.spawn,
                {
                    "assignment": this.room.controller,
                    "workRoom": this.room.name,
                    "patternRepetitionLimit": supplierSize // This.settings.supplierPatternRepetitionLimit
                }
            );

        }

        return null;

    }

    handleWorkers () {

        if (this.incubating) {

            return null; // Don't make your own workers during incubation period, just keep existing ones alive

        }
        let numWorkers = this.room.controller.getAssignedCreepAmounts("worker"),
            // Only Spawn workers once containers are up
		 workerRequirements = 0;

        if (this.room.storage) {

            workerRequirements = this.calculateWorkerRequirementsByJobs(); // Switch to worker/upgrader once storage

        } else {

            workerRequirements = this.calculateWorkerRequirementsByEnergy(); // No static upgraders prior to RCL4

        }
        if (numWorkers < workerRequirements && this.room.storageUnits.length > 0) {

            return roles("worker").create(
                this.spawn,
                {
                    "assignment": this.room.controller,
                    "workRoom": this.room.name,
                    "patternRepetitionLimit": this.settings.workerPatternRepetitionLimit
                }
            );

        }

        return null;

    }

    handleUpgraders () {

        if (!this.room.storage) { // Room needs to have storage before upgraders happen

            return null;

        }
        let numUpgraders = this.room.controller.getAssignedCreepAmounts("upgrader"),
		 amountOver = Math.max(
                this.room.storage.store[RESOURCE_ENERGY] -
			this.settings.storageBuffer.upgrader,
                0
            ),
		 upgraderSize = 1 + Math.floor(amountOver / 20000);

        if (this.room.controller.level == 8) {

            upgraderSize = Math.min(
                upgraderSize,
                5
            ); // Don't go above 15 work parts at RCL 8

        }
        const numUpgradersNeeded = Math.ceil(upgraderSize * roles("upgrader").bodyPatternCost /
			this.room.energyCapacityAvailable); // This causes a jump at 2 upgraders

        if (numUpgraders < numUpgradersNeeded) {

            return roles("upgrader").create(
                this.spawn,
                {
                    "assignment": this.room.controller,
                    "workRoom": this.room.name,
                    "patternRepetitionLimit": upgraderSize
                }
            );

        }

        return null;

    }


    // Inferred spawner operations =====================================================================================

    handleRemoteHaulers () {

        // Check enough haulers exist to satisfy all demand from associated rooms
        if (this.room.storage != undefined) { // Haulers are only built once a room has storage

            const haulingNeeded = this.calculateRemoteHaulingRequirements(),
			 haulingSupplied = _.sum(
                    _.map(this.room.storage.getAssignedCreeps("hauler")),
                    (c) => c.carryCapacity
                );

            if (haulingSupplied < haulingNeeded) {

                return roles("hauler").create(
                    this.spawn,
                    {
                        "assignment": this.room.storage, // Remote haulers are assigned to storage
                        "workRoom": this.room.name,
                        "patternRepetitionLimit": Infinity
                    }
                );

            }

        }

        return null;

    }

    /*
     * Spawner operations ==============================================================================================
     * TODO: Move to Brain_Spawn.js
     */

    handleCoreSpawnOperations () { // Core operations needed to keep a room running; all creeps target things in room

        let handleResponse,
            // Domestic operations
		 prioritizedDomesticOperations = [
                () => this.handleSuppliers(), // Don't move this from top
                () => this.handleLinkers(),
                () => this.handleMineralSuppliers(),
                () => this.handleMiners(),
                () => this.handleHaulers(),
                () => this.handleWorkers(),
                () => this.handleUpgraders()
            ];

        // Handle domestic operations
        for (const handler of prioritizedDomesticOperations) {

            handleResponse = handler();
            if (handleResponse != null) {

                return handleResponse;

            }

        }

        // Renew expensive creeps if needed
        const creepsNeedingRenewal = this.spawn.pos.findInRange(
            FIND_MY_CREEPS,
            1,
            {
                "filter": (creep) => creep.memory.data.renewMe && creep.ticksToLive < 500
            }
        );

        if (creepsNeedingRenewal.length > 0) {

            return "renewing (renew call is done through task_getRenewed.work)";

        }

        return null;

    }

    handleIncubationSpawnOperations () { // Operations to start up a new room quickly by sending renewable large creeps

        let incubateFlags = _.filter(
            this.room.assignedFlags,
            (flag) => flagCodes.territory.claimAndIncubate.filter(flag) &&
				flag.room && flag.room.controller.my
        );

        incubateFlags = _.sortBy(
            incubateFlags,
            (flag) => flag.pathLengthToAssignedRoomStorage
        );
        for (const flag of incubateFlags) {

            // Spawn miner creeps
            const minerBehavior = roles("miner");

            for (const source of flag.room.sources) {

                if (source.getAssignedCreepAmounts("miner") < this.settings.minersPerSource) {

                    const creep = roles("miner").create(
                        this.spawn,
                        {
                            "assignment": source,
                            "workRoom": flag.room.name
                        }
                    );

                    creep.memory.data.renewMe = true;

                    return creep;

                }

            }
            // Spawn worker creeps
            const workerBehavior = roles("worker"),
			 assignedWorkers = flag.room.controller.getAssignedCreeps("worker"),
			 incubationWorkers = _.filter(
                    assignedWorkers,
                    (c) => c.body.length >= workerBehavior.settings.bodyPattern.length *
					this.settings.workerPatternRepetitionLimit
                );

            if (incubationWorkers.length < this.settings.incubationWorkersToSend) {

                const creep = workerBehavior.create(
                    this.spawn,
                    {
                        "assignment": flag.room.controller,
                        "workRoom": flag.room.name,
                        "patternRepetitionLimit": this.settings.workerPatternRepetitionLimit
                    }
                );

                creep.memory.data.renewMe = true;

                return creep;

            }

        }

        return null;

    }

    handleAssignedSpawnOperations () { // Operations associated with an assigned flags, such as spawning millitary creeps

        let handleResponse;
        // Flag operations
        const flags = this.room.assignedFlags, // TODO: make this a lookup table
            prioritizedFlagOperations = [
                _.filter(
                    flags,
                    flagCodes.vision.stationary.filter
                ),
                _.filter(
                    flags,
                    flagCodes.territory.claimAndIncubate.filter
                ),
                _.filter(
                    flags,
                    flagCodes.millitary.guard.filter
                ),
                _.filter(
                    flags,
                    flagCodes.territory.reserve.filter
                ),

                _.filter(
                    flags,
                    flagCodes.rally.healPoint.filter
                ),
                _.filter(
                    flags,
                    flagCodes.millitary.destroyer.filter
                ),
                _.filter(
                    flags,
                    flagCodes.millitary.sieger.filter
                ),

                _.filter(
                    flags,
                    flagCodes.industry.remoteMine.filter
                )
            ];

        // Handle actions associated with assigned flags
        for (const flagPriority of prioritizedFlagOperations) {

            const flagsSortedByRange = _.sortBy(
                flagPriority,
                (flag) => flag.pathLengthToAssignedRoomStorage
            );

            for (const flag of flagsSortedByRange) {

                handleResponse = flag.action(this);
                if (handleResponse != null) {

                    return handleResponse;

                }

            }

        }

        return null;

    }


    handleInferredSpawnOperations () { // Spawn operations handled locally but inferred by assigned operations

        let handleResponse,
		 prioritizedOperations = [() => this.handleRemoteHaulers()];

        for (const handler of prioritizedOperations) {

            handleResponse = handler();
            if (handleResponse != null) {

                return handleResponse;

            }

        }

        return null;

    }

    assistAssignedSpawnOperations () { // Help out other rooms with their assigned operations

        // Other rooms sorted by increasing distance
        const myRooms = _.sortBy(
            _.filter(
                Game.rooms,
                (room) => room.my
            ),
            (room) => this.spawn.pathLengthTo(room.spawns[0])
        );

        for (const i in myRooms) {

            const {brain} = myRooms[i],
                distance = this.spawn.pathLengthTo(myRooms[i].spawns[0]);

            if (!brain.spawn) {

                brain.spawn = this.spawn;
                const creepToBuild = brain.handleAssignedSpawnOperations();

                if (creepToBuild != null) {

                    let lifetime;

                    if (_.map(
                        creepToBuild.body,
                        (part) => part.type
                    ).includes(CLAIM)) {

                        lifetime = 500;

                    } else {

                        lifetime = 1500;

                    }
                    if (distance < this.settings.maxAssistLifetimePercentage * lifetime) {

                        // Build the creep if it's not too far away
                        return creepToBuild;

                    }

                }

            }

        }

        return null;

    }

    handleSpawnOperations () {

        if (this.spawn && !this.spawn.spawning) { // Only Spawn if you have an available spawner

            // Figure out what to Spawn next
            let creep,
			 prioritizedSpawnOperations = [
     () => this.handleCoreSpawnOperations(),
     () => this.handleIncubationSpawnOperations(),
     () => this.handleAssignedSpawnOperations(),
     () => this.handleInferredSpawnOperations()
                // () => this.assistAssignedSpawnOperations()
 ];
            // Handle all operations

            for (const spawnThis of prioritizedSpawnOperations) {

                creep = spawnThis();
                if (creep != null) {

                    return this.spawn.createCreep(
                        creep.body,
                        creep.name,
                        creep.memory
                    );

                }

            }

            return null;

        }

        return null;

    }


    // Market operations ===============================================================================================

    handleTerminalOperations () {

        if (this.room.terminal != undefined) {

            this.room.terminal.brain.run();

        }

    }


    // Safe mode condition =============================================================================================

    handleSafeMode () { // TODO: make this better, defcon system

        /*
         * Var criticalBarriers = this.room.find(FIND_STRUCTURES, {
         *     Filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) &&
         *                    S.hits < 5000
         * });
         */
        const criticalBarriers = _.filter(
            this.room.barriers,
            (s) => s.hits < 5000
        );

        if (criticalBarriers.length > 0 && this.room.hostiles.length > 0 && !this.incubating) {

            // No safe mode for incubating rooms (?)
            this.room.controller.activateSafeMode();

        }

    }

    // List of things executed each tick; only run for rooms that are owned
    run () {

        this.handleSafeMode();
        this.handleSpawnOperations(); // Build creeps as needed
        this.handleTerminalOperations(); // Repleneish needed resources

    }

}

// Const profiler = require('screeps-profiler');
profiler.registerClass(
    RoomBrain,
    "RoomBrain"
);

module.exports = RoomBrain;
