'use strict';

import Cache from './Cache.mjs';
import RoomPosition from './roomPosition.mjs';
import Arena from './getArena.mjs';


class Group {
	constructor(name, collection) {
		this.name = name;
		this.leader = null;
		this._members = [];
		this.collection = collection;
		this.targetDefinition = null;
		this.goalDefinition = null;
		this.alertRange = null;
		this.optimalSpread = 2;
	}

	get members() {
		if (!Cache.has(`members-${this.name}`)) {
			for (const creep of this._members) {
				if (creep.isDead)
					this.delete(creep);
			}

			Cache.add(`members-${this.name}`);
		}

		return this._members;
	}

	get wounded() {
		return this.members
		.filter(i => i.isWounded)
		.sort(Util.byHits());
	}

	get isSpreadTooHigh() {
		return this.spread >= this.optimalSpread + 1;
	}

	get isSpreadOk() {
		return this.spread <= this.optimalSpread;
	}

	get spread() {
		const leader = this.leader;
		const sorted = this.members.sort(Util.byRangeTo(leader, true));
		return leader.getRangeTo(sorted[0]);
	}

	full(role) {
		let groupHas = _.filter(this.members,
			member => member.role === role).length;
		return groupHas === this.collection.members[role.toLowerCase()];
	}

	add(creep) {
		if (this.full(creep.role))
			return false;

		this._members.push(creep);
		creep.group = this;

		// console.log(`group: ${this.name} creep: ${creep.id}`)

		if (!this.leader && creep.role === this.collection.leader) {
			this.leader = creep;
		}
		return true;
	}

	delete(creep) {
		const index = this._members.indexOf(creep);

		if (index !== -1)
			this._members.splice(index, 1);


		creep.group = null;

		if (this.leader === creep) {

			this.leader = _.filter(this._members,
				member => member.role === 'Ranged'
					|| member.role === 'Melee')[0];

			if (!this.leader && this._members[0])
				this.leader = this._members[0];

			if (this.leader)
				console.log(`${this.name} new leader`, this.leader.role);
			else {
				console.log(`Last creep died in ${this.name}`);
				this.leader = null;
			}
		}
	}

	update() {
		const members = this.members;

		if (members.length === 0)
			return;

		const leader = this.leader;
		const target = this.targetDefinition;
		const goal = this.goalDefinition;
		const alertRange = this.alertRange;
		const isSpreadTooHigh = this.isSpreadTooHigh;

		for (const creep of members) {
			creep.alertRange = alertRange;
			creep.target = target[creep.role.toString()];

			if (isSpreadTooHigh) {
				if (!creep.inRangeTo(leader, this.optimalSpread)) {
					// this.keepFormation(creep)
					creep.goal = new RoomPosition('leader', this.leader)
				} else
					creep.goal = new RoomPosition('creep', creep);
			} else {
				creep.goal = goal[creep.role.toString()].position;
			}

			creep.update();
		}
	}

	occupiedByCreep(position) {
		for (const creep of Arena.creeps) {
			if (creep.standsNear(position) || (creep.my && creep.goal === position))
				return true;
		}
		return false;
	}

	keepFormation(creep) {
		const leader = this.leader;
		const members = this.members;

		let formationPositions = [
				{
					role: 'Melee',
					position: {
						x: leader.x - 1,
						y: leader.y,
					},

				},
				{
					role: 'Ranged',
					position: {
						x: leader.x - 1,
						y: leader.y,
					},
				},
				{
					role: 'Healer_1',
					position: {
						x: leader.x - 1,
						y: leader.y - 1,
					},
				},
				{
					role: 'Healer_2',
					position: {
						x: leader.x,
						y: leader.y - 1,
					},
				},
			];

		if (creep.id === leader.id)
			return;
		// else {
		// 	for (const member of members) {
		// 		memberPositions.push(new RoomPosition(member.role, {x: member.x, y: member.y}));
		// 	}
		// }


		for (const formationPosition of formationPositions) {
			if ((formationPosition.role === 'Healer_1' || formationPositions.role === 'Healer_2')
				&& creep.role === 'Healer') {
				if (!this.occupiedByCreep(formationPosition.position))
					creep.goal = formationPosition;

			} else if (formationPosition.role === 'Melee' && creep.role === 'Melee') {
				if (!this.occupiedByCreep(formationPosition.position))
					creep.goal = formationPosition;

			} else if (formationPosition.role === 'Ranged' && creep.role === 'Ranged') {
				if (!this.occupiedByCreep(formationPosition.position))
					creep.goal = formationPosition;
			}
		}
	}

	positionReached(position) {
		const members = this.members;
		// if (this.goalDefinition.length === 1)
		// 	return this.members.some(i => i.standsOn(position))
		// else
		return members.some(i => i.standsNear(position));

		// return this.leader.standsOn(position)

		// console.log(`group: ${this.name} standsOn: ${standsOn} spread: ${this.spread}`)


	}
}

export default Group;
