import {getTicks} from '/game/utils';
import {getObjectsByPrototype} from '/game/utils';
import {Creep, StructureSpawn, OwnedStructure, Structure, GameObject} from '/game/prototypes';
import {MOVE, WORK, RANGED_ATTACK, HEAL, ATTACK, BODYPART_COST, RESOURCE_ENERGY} from '/game/constants';
import {searchPath} from '/game/path-finder';
import * as Utils from './utils.mjs';
import Parameters from './parameters.mjs';


let mySpawns, myCreeps, enemyCreeps;

StructureSpawn.prototype.display = (bodyParts) => {
	console.log(`bodyParts: ${bodyParts}`);
}

StructureSpawn.prototype.execute = (bodyParts) => {
	StructureSpawn.display(bodyParts)
}

export function loop() {

	console.log('Current tick:', getTicks());




	mySpawns = getObjectsByPrototype(StructureSpawn);
	// myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
	// enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);

	// console.log(`Creep: ${StructureSpawn}`);




	// console.log(`mySpawns: ${Utils.json(mySpawns)}`);
	// console.log(`myCreeps: ${Utils.json(myCreeps)}`);
	// console.log(`enemyCreeps: ${Utils.json(enemyCreeps)}`);

	// if (myCreeps.length === 0)
	// 	console.log(`No creeps`);
	// else {
	// 	for (let creep of enemyCreeps) {
	// 		if (creep)
	// 			console.log(`creeps: ${creep}`);
	// 	}
	// }

	for (let spawn of mySpawns) {
		for (let creepType of Parameters.creepsOrder) {
			let bodyParts = Parameters.creepsDefaultBody[creepType];
			// console.log(`creepType: ${creepType} bodyParts: ${bodyParts}`);
			spawn.execute(bodyParts)
		}
	}

	// if (getTicks() % 10 === 0) {
	// 	console.log(`I have ${myCreeps.length} creeps`);
	// 	console.log(`myCreeps: ${myCreeps}`);
	// }
}
