import {getObjectsByPrototype, getDirection, getRange, getTime} from '/game/utils';
import {Creep, StructureSpawn} from '/game/prototypes';
import {MOVE, RANGED_ATTACK, HEAL, ATTACK} from '/game/constants';
import {searchPath} from '/game/path-finder';
// import {json} from './utils'

let myCreeps, enemyCreeps, mySpawn;

export function loop() {
	myCreeps = getObjectsByPrototype(Creep).filter(creeps => creeps.my);
	enemyCreeps = getObjectsByPrototype(Creep).filter(creeps => !creeps.my);
	mySpawn = getObjectsByPrototype(StructureSpawn)[0];

	// let json = function (x) {
	// 	console.log(JSON.stringify(x, null, 2));
	// };

	function meleeAttacker(creep) {

		// Here is the alternative to the creep "memory" from Screeps World. All game objects are persistent.
		// You can assign any property to it once, and it will be available during the entire match.
		if (!creep.initialPos) {
			creep.initialPos = {x: creep.x, y: creep.y};
		}

		const targets = enemyCreeps.filter(i => getRange(i, creep.initialPos) < 10)
		.sort((a, b) => getRange(a, creep) - getRange(b, creep));

		if (targets.length > 0) {
			creep.moveTo(targets[0]);
			creep.attack(targets[0]);
		} else {
			creep.moveTo(creep.initialPos);
		}
	}

	function rangedAttacker(creep) {
		const targets = enemyCreeps.filter(i => true)
		.sort((a, b) => getRange(a, creep) - getRange(b, creep));

		if (targets.length > 0) {
			creep.rangedAttack(targets[0]);
		}

		creep.moveTo(enemyFlag);

		const range = 3;
		const enemiesInRange = enemyCreeps.filter(i => getRange(i, creep) < range);
		if (enemiesInRange.length > 0) {
			flee(creep, enemiesInRange, range);
		}
	}

	function healer(creep) {

		const targets = myCreeps.filter(i => i !== creep && i.hits < i.hitsMax)
		.sort((a, b) => a.hits - b.hits);

		if (targets.length) {
			creep.moveTo(targets[0]);
		} else {
			creep.moveTo(enemyFlag);
		}

		const healTargets = myCreeps.filter(i => getRange(i, creep) <= 3)
		.sort((a, b) => a.hits - b.hits);

		if (healTargets.length > 0) {
			if (getRange(healTargets[0], creep) === 1) {
				creep.heal(healTargets[0]);
			} else {
				creep.rangedHeal(healTargets[0]);
			}
		}

		const range = 7;
		const enemiesInRange = enemyCreeps.filter(i => getRange(i, creep) < range);
		if (enemiesInRange.length > 0) {
			flee(creep, enemiesInRange, range);
		}

		creep.moveTo(enemyFlag);
	}

	function flee(creep, targets, range) {
		let result = searchPath(creep, targets.map(i => ({pos: i, range})), {flee: true});
		if (result.path.length > 0) {
			let direction = getDirection(result.path[0].x - creep.x, result.path[0].y - creep.y);
			creep.move(direction);
		}
	}

	// Notice how getTime is a global function, but not Game.time anymore
	if (getTime() % 10 === 0) {
		console.log(`myCreeps: ${myCreeps.length}`);
		console.log(`enemyCreeps: ${enemyCreeps.length}`);
		console.log(`mySpawn: ${mySpawn}`);
	}
}
