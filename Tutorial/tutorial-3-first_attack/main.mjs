import {getObjectsByPrototype} from '/game/utils';
import {Creep} from '/game/prototypes';
import {ERR_NOT_IN_RANGE} from '/game/constants';
import {} from '/arena';

export function loop() {


	let myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my),
		enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);

	if (myCreeps[0].attack(enemyCreeps[0]) === ERR_NOT_IN_RANGE) {
		myCreeps[0].moveTo(enemyCreeps[0]);
	}

}
