import {getTicks} from '/game/utils';
import {getObjectsByPrototype} from '/game/utils';
import {Creep, StructureSpawn} from '/game/prototypes';
import {MOVE, WORK, RANGED_ATTACK, HEAL, ATTACK} from '/game/constants';
import {searchPath} from '/game/path-finder';
import * as Utils from './utils.mjs'

let mySpawn, myCreeps, enemyCreeps;

export function loop() {
	console.log('Current tick:', getTicks());
	mySpawn = getObjectsByPrototype(StructureSpawn)[0];
	myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
	enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);


	console.log(`spawn: ${Utils.json(mySpawn)}`);
	console.log(`myCreeps: ${Utils.json(myCreeps)}`);
	console.log(`EnemyCreeps: ${Utils.json(enemyCreeps)}`);



}
