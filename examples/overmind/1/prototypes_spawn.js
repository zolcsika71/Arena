const rolesMap = require("rolesMap");

StructureSpawn.prototype.countCreeps = (type) => {

    const creeps = _.filter(
        Game.creeps,
        (creep) => creep.memory.role === type
    );


    return creeps.length;

};

StructureSpawn.prototype.creepName = (roleName) => {

    let i = 0;

    while (Game.creeps[`${roleName}_${i}`] != undefined) {

        i++;

    }

    return `${roleName}_${i}`;

};

StructureSpawn.prototype.createBiggestCreep = function (roleName, partsLimit = Infinity) {

    // Create a balanced body as big as possible with the given energy
    let energy = this.room.energyCapacityAvailable, // Total energy available for Spawn + extensions
        numberOfParts = Math.floor(energy / 200);
    // Make sure the creep is not too big (more than 50 parts)

    numberOfParts = Math.min(
        numberOfParts,
        Math.floor(50 / 3),
        partsLimit
    );
    const body = [];

    for (let i = 0; i < numberOfParts; i++) {

        body.push(WORK);

    }
    for (let i = 0; i < numberOfParts; i++) {

        body.push(CARRY);

    }
    for (let i = 0; i < numberOfParts; i++) {

        body.push(MOVE);

    }
    // Create creep with the created body and the given role
    return this.createCreep(
        body,
        this.creepName(roleName),
        {"role": roleName}
    );

};

StructureSpawn.prototype.run = function () { // TODO: automatic creep number calculations

    const creepSizeLimit = 3;

    for (const roleName in rolesMap) {

        const roleObject = rolesMap[roleName];

        if (this.countCreeps(roleName) < roleObject.amount) {

            roleObject.behavior.create(
                this,
                creepSizeLimit
            );
            break;

        }

    }

};

StructureSpawn.prototype.donateCreepToRoom = function (roleName, roomName) {

    const roleObject = rolesMap[roleName];

    if (roleObject) {

        if (Game.rooms[roomName]) {

            const donatedCreep = roleObject.behavior.create(
                this,
                5
            ); // Manual size setter for now

            donatedCreep.donate(roomName);

        } else {

            console.log(`Error: ${roomName} is ${Game.rooms[roomName]}`);

        }

    } else {

        console.log(`Error: ${roleName} is not a valid role.`);

    }

};
