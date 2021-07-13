import {StructureSpawn} from '/game/prototypes';
import {BODYPART_COST, RESOURCE_ENERGY} from '/game/constants';
import * as Utils from './utils.mjs';


StructureSpawn.execute = (bodyParts) => {
	// let enoughEnergy = this.enoughEnergy(bodyParts);
	// if (enoughEnergy)
	// 	console.log(`CREATE: ${enoughEnergy}`);
	// return this.create(bodyParts);
	return this.spawnCreep(bodyParts).object;
};

StructureSpawn.enoughEnergy = (bodyParts) => {
	if (bodyParts.length === 0)
		return false;
	let cost = 0;
	for (let part of bodyParts) {
		cost += BODYPART_COST[part];
	}
	console.log(`cost: ${cost}`);
	console.log(`Spawn: ${Utils.json(StructureSpawn)}`);
	return cost <= this.store[RESOURCE_ENERGY];
	// return cost;
};

StructureSpawn.create = (bodyParts) => {
	if (bodyParts.length === 0)
		return false;
	return this.spawnCreep(bodyParts).object;
};

export {StructureSpawn}



