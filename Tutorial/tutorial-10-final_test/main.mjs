import {getTicks} from '/game/utils';
import {getObjectsByPrototype} from '/game/utils';
import {Creep, StructureSpawn, OwnedStructure, Structure, GameObject} from '/game/prototypes';
import {MOVE, WORK, RANGED_ATTACK, HEAL, ATTACK, BODYPART_COST, RESOURCE_ENERGY} from '/game/constants';
import {searchPath} from '/game/path-finder';
import * as Utils from './utils.mjs';
import Parameters from './parameters.mjs';
import _ from './lib/lodash-es/lodash';


let mySpawns,
	myCreeps_type = {
		'worker': 0,
		'healer': 0,
		'meleeAttacker': 0,
		'rangedAttacker': 0,
	},
	enemyCreeps;


export function loop() {

	let enoughEnergy = (spawn, bodyParts) => {
		let cost = 0;
		for (let part of bodyParts) {
			cost += BODYPART_COST[part];
		}
		console.log(`cost: ${cost}`);
		console.log(`Spawn: ${Utils.json(StructureSpawn)}`);
		return cost <= spawn.store[RESOURCE_ENERGY];
	};


	console.log('Current tick:', getTicks());

	mySpawns = getObjectsByPrototype(StructureSpawn);
	let myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
	enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);


	for (let spawn of mySpawns) {
		for (let creepType of Parameters.creepsQueued) {
			let bodyParts = Parameters.creepsDefaultBody[creepType];
			// console.log(`creepType: ${creepType} bodyParts: ${bodyParts}`);
			// myCreeps.push(spawn.spawnCreep(bodyParts).object);

			let creepExist = _.some(myCreeps, creep => {
				// console.log(`body: ${Utils.json(creep.body)}`);
				return creep.body === bodyParts;
			});

			console.log(`bodyParts: ${bodyParts}`)


			if (!creepExist && enoughEnergy(spawn, bodyParts)) {
				console.log(`SPAWN: ${bodyParts}`);
				// myCreeps.push(spawn.spawnCreep(bodyParts).object);
				myCreeps[creepType] += 1;
			}

			// console.log(`I have ${myCreeps.length} creeps`);
			// console.log(`myCreeps: ${Utils.json(myCreeps)}`);

		}
	}
}
