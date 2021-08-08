'use strict';

import RoomPosition from './roomPosition.mjs';
import CapturePoint from './CapturePoints.mjs';

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
		if (!GameCache.has(`members-${this.name}`)) {
			for (const creep of this._members) {
				if (creep.isDead)
					this.delete(creep);
			}

			GameCache.add(`members-${this.name}`);
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
		// return leader.getRangeTo(sorted[0]);
		return Game.getRange(leader, sorted[0]);
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

			// if (isSpreadTooHigh) {
			// 	if (!creep.inRangeTo(leader, this.optimalSpread)) {
			// 		// this.keepFormation(creep)
			// 		creep.goal = new RoomPosition('leader', this.leader)
			// 	} else
			// 		creep.goal = new RoomPosition('creep', creep);
			// } else {
			// 	creep.goal = goal[creep.role.toString()].position;
			// }

			if (creep.id === leader.id)
				creep.goal = goal[creep.role.toString()];
			else
				creep.goal = this.keepFormation(creep, members);


			creep.update();
		}
	}

	keepFormation(creep, members) {
		const leader = this.leader;

		let formationPositions = {
			square: {
				Melee: {
					positions: [
						new RoomPosition('',{x: leader.x - 1, y: leader.y})
					]
				},
				Ranged: {
					positions: [
						new RoomPosition('',{x: leader.x - 1, y: leader.y})
					]
				},
				Healer: {
					positions: [
						new RoomPosition('',{x: leader.x - 1, y: leader.y - 1}),
						new RoomPosition('',{x: leader.x, y: leader.y - 1})
					]
				}
			}
		}

		let position = function (positions) {
			if (positions.length === 1)
				return positions[0]

			let occupied = function (position) {
				let returnValue = false;
				for (const member of members) {
					if (member.goal)
						returnValue = Util.sameCoord(member.goal.position, position)
				}
				return returnValue

			}

			for (const position of positions) {
				if (!occupied(position))
					return position
			}
		}

		let possiblePositions = formationPositions.square[creep.role.toString()].positions;

		let goalPosition = new RoomPosition(`${'Creep ' + creep.id}`, position(possiblePositions))

		return new CapturePoint(goalPosition)

	}

	positionReached(position) {
		const members = this.members;
		return members.some(i => i.standsOn(position));
	}
}

export default Group;
