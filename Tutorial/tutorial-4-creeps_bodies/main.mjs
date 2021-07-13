import {getObjectsByPrototype} from '/game/utils';
import {Creep} from '/game/prototypes';
import {ERR_NOT_IN_RANGE, ATTACK, RANGED_ATTACK, HEAL} from '/game/constants';
import {} from '/arena';

export function loop() {

	const bodyParts = [ATTACK, RANGED_ATTACK, HEAL];

	let myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my),
		enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my),
		attack = function (creep) {
			let enemy = enemyCreeps[0];
			if (creep.attack(enemy) === ERR_NOT_IN_RANGE)
				creep.moveTo(enemyCreeps[enemy]);
		},
		rangedAttack = function (creep) {
			let enemy = enemyCreeps[0];
			if (creep.rangedAttack(enemy) === ERR_NOT_IN_RANGE) {
				creep.moveTo(enemy);
			}
		},
		heal = function (creep) {
			let wounded = myCreeps.sort((a, b) => a.hits - b.hits)[0];
			if (creep.heal(wounded) === ERR_NOT_IN_RANGE)
				creep.moveTo(wounded);
		};


	for (let creep of myCreeps) {
		for (let part of bodyParts) {
			if (creep.body.some(bodyPart => bodyPart.type === part)) {
				switch (part) {
					case 'attack':
						attack(creep);
						break;
					case 'ranged_attack':
						rangedAttack(creep)
						break;
					case 'heal':
						heal(creep)
						break;
				}
			}
		}
	}
}
