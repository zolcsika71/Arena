// import {prototypes, utils, constants} from '/game';

import {getObjectsByPrototype} from '/game/utils';
import {Creep, StructureTower, StructureContainer} from '/game/prototypes';
import {RESOURCE_ENERGY} from '/game/constants';

export function loop() {
	const tower = getObjectsByPrototype(StructureTower)[0];
	if (tower.store[RESOURCE_ENERGY] < 10) {
		let myCreep = getObjectsByPrototype(Creep).find(creep => creep.my);
		if (myCreep.store[RESOURCE_ENERGY] === 0) {
			let container = getObjectsByPrototype(StructureContainer)[0];
			myCreep.withdraw(container, RESOURCE_ENERGY);
		} else {
			myCreep.transfer(tower, RESOURCE_ENERGY);
		}
	} else {
		let target = getObjectsByPrototype(Creep).find(creep => !creep.my);
		tower.attack(target);
	}
}

