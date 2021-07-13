import {getObjectsByPrototype} from '/game/utils';
import {Creep, Flag} from '/game/prototypes';

export function loop() {

	let json = (x) => {
		return JSON.stringify(x, null, 2);
	};


	let creeps = getObjectsByPrototype(Creep);
	// console.log(`creeps: ${json((creeps[0]))}`);

	let flags = getObjectsByPrototype(Flag);
	console.log(`flags: ${json(flags[0])}`);
	creeps[0].moveTo(flags[0]);
}

