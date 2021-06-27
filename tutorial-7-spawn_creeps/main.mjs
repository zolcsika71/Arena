import { getObjectsByPrototype } from '/game/utils';
import { Creep, Flag, StructureSpawn } from '/game/prototypes';
import { MOVE } from '/game/constants';

let creep1, creep2;

export function loop() {
	let mySpawn = getObjectsByPrototype(StructureSpawn)[0];
	let flags = getObjectsByPrototype(Flag);

	if(!creep1) {
		creep1 = mySpawn.spawnCreep([MOVE]).object;
	} else {
		creep1.moveTo(flags[0]);

		if(!creep2) {
			creep2 = mySpawn.spawnCreep([MOVE]).object;
		} else {
			creep2.moveTo(flags[1]);
		}
	}
}
