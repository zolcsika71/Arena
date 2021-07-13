import {getObjectsByPrototype, findClosestByPath} from '/game/utils';
import {Creep, Flag} from '/game/prototypes';


// import { } from '/game/utils';
// import { } from '/game/prototypes';
// import { } from '/game/constants';
// import { } from '/arena';

export function loop() {
	let creeps = getObjectsByPrototype(Creep).filter(i => i.my),
		flags = getObjectsByPrototype(Flag);

	for (let creep of creeps) {
		let flag = creep.findClosestByPath(flags);
		creep.moveTo(flag);
	}
}
