'use strict';

import Arena from '/user/getArena.mjs';
import Group from '../group.mjs';
import Util from '/user/utils/utils.mjs';


class CaptureTheFlagBasic {

	constructor() {
		this.attackers = [];
		this.defenders = [];
	};

	get className() {
		return 'CTF_Basic';
	}


	log_Creeps(creeps) {

		let melee = 0, ranged = 0, healer = 0;

		for (const creep of creeps) {
			console.log(`Creep: ${creep.id}`);
			if (creep.isMelee) {
				melee += 1;
				console.log(`melee ${Util.json(creep.bodyParts)}`);
			} else if (creep.isRanged) {
				ranged += 1;
				console.log(`ranged: ${Util.json(creep.bodyParts)}`);
			} else if (creep.isHealer) {
				console.log(`healer: ${Util.json(creep.bodyParts)}`);
				healer += 1;
			} else
				console.log(`Unknown creep type`);
		}


		console.log(`melee: ${melee}`);
		console.log(`ranged: ${ranged}`);
		console.log(`healer: ${healer}`);

	}


	start() {
		console.log(`CTF_Basic`);

		let myCreep_count = 0, enemyCreepCount = 0, melee = 0, ranged = 0, healer = 0;

		// console.log(`Creeps: ${Arena.creeps.length}`);
		// console.log(`myCreep: ${Arena.myCreeps.length}`);
		// console.log(`enemyCreeps: ${Arena.enemyCreeps.length}`);
		//
		// this.log_Creeps(Arena.myCreeps);

		let attackers = ['Attacker-1', 'Attacker-2', 'Attacker-3', 'Defender-1'],
			defenders = ['Defender-1']

		for (const team of attackers)
			this.attackers.push(new Group(team))

		for (const team of defenders)
			this.defenders.push(new Group(team))





		for (const creep of Arena.myCreeps) {
			if (creep.isMelee) {
				this.defenders[0].add(creep)

			}

			if (creep.isRanged) {
				if (defenders.members.length === 0) {
				//	if no defenders
				}
			} else {

			}



			if (creep.isHealer) {

			}



		}


	}

	update() {
		console.log(`CTF_Basic_UPDATE`);
	}
}

export default CaptureTheFlagBasic;
