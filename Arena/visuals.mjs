'use strict';


import {yellow} from './utils/color.mjs';

class Visuals {

	start() {
		this.creepType(true)
	}

	update() {
		this.creepType()
	}

	logCreep(creep, pos) {

		if (creep.group.name !== 'Attacker_3')
			return

		let leader = creep.group.leader;

		console.log(`${red(`${creep.role}Id`)}: [${yellow(creep.id)}]`);
		console.log(`creep: ${creep.toString()}`);
		console.log(`leader: ${leader.toString()}`);

		if (leader.goal)
			console.log(`leaderGoal: ${leader.goal.toString()}`);
		else
			console.log(`leaderGoal: undefined`);

		if (creep.goal)
			console.log(`creepGoal: ${creep.goal.toString()}`);
		else
			console.log(`creepGoal: undefined`);

		if (creep.travel && creep.travel.state && creep.travel.state.nextPos)
			console.log(`nextPos: ${creep.travel.state.nextPos.toString()}`);
		else
			console.log(`nextPos: undefined`);

		console.log(`pos: x: ${pos.x}, y: ${pos.y}`)
	}

	creepType(start = false) {

		let pos;



		for (const creep of Arena.myCreeps) {

			if (start){
				pos = creep;
			} else {
				let nextPos = creep.travel.state.nextPos;
				pos = _.isUndefined(nextPos) ? creep : nextPos;
			}

			if (creep.role === 'Melee') {
				// this.logCreep(creep, pos);
				Game.circle(pos, style.creep.melee);
			}
			else if (creep.role === 'Ranged') {
				// this.logCreep(creep, pos);
				Game.circle(pos, style.creep.ranged);
			}
			else if (creep.role === 'Healer') {
				// this.logCreep(creep, pos);
				Game.circle(pos, style.creep.healer);
			}
		}
	}

}

export default new Visuals();
