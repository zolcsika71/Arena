'use strict';

import RoomPosition from './roomPosition.mjs';
import CapturePoint from './CapturePoints.mjs';

class Group {
	constructor(name, collection) {
		this.name = name;
		this.leader = null;
		this._members = [];
		this.memberId = [];
		this.lastDirection = null;
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

	isFormationOk(members) {
		let formationOk = true;
		for (const member of members) {
			if (!this.keepFormation(member, this.leader, true)) {
				formationOk = false;
				break;
			}
		}
		return formationOk;
	}

	full(role, members) {
		let groupHas = _.filter(members,
			member => member.role === role).length;
		return groupHas === this.collection.members[role.toLowerCase()];
	}

	getMemberId(creep, members) {
		if (creep.role === 'Ranged' || creep.role === 'Melee')
			creep.memberId = 1;
		else if (creep.role === 'Healer') {
			if (_.some(members, member => member.memberId === 2))
				creep.memberId = 3;
			else
				creep.memberId = 2;
		}
	}

	add(creep) {
		const members = this.members;

		if (this.full(creep.role, members))
			return false;

		this._members.push(creep);
		creep.group = this;

		// select leader
		if (!this.leader && creep.role === this.collection.leader) {
			this.leader = creep;
			creep.memberId = 0;
		} else
			this.getMemberId(creep, members);

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

		const target = this.targetDefinition;
		const goal = this.goalDefinition;
		const alertRange = this.alertRange;
		const leader = this.leader;
		const isSpreadTooHigh = this.isSpreadTooHigh;

		let groupGoal = goal[leader.role.toString()];
		let groupTarget = target[leader.role.toString()];

		for (const creep of members) {
			creep.alertRange = alertRange;

			if (!this.isFormationOk(members)) {
				creep.goal = this.keepFormation(creep, leader);

			} else if (creep.role === 'Ranged' || creep.role === 'Melee') {
				if (target.Ranged || target.Melee) {
					if (creep.id === leader.id)
						creep.target = groupTarget;
					else
						creep.goal = this.keepFormation(creep, groupTarget);
				} else
					creep.goal = this.keepFormation(creep, groupGoal);
			} else {
				creep.target = target[creep.role.toString()];
				creep.goal = this.keepFormation(creep, groupGoal);
			}

			creep.update();
		}
	}

	keepFormation(creep, target, check = false) {
		const leader = this.leader;
		let direction;
		let offset;
		let equator;


		if (_.isEqual(leader, target)) {
			if (Arena.isBaseAtNorthWest)
				direction = Game.BOTTOM_RIGHT;
			else
				direction = Game.TOP_LEFT;
		} else
			direction = leader.pos.getDirectionTo(target.position);

		if (direction !== 0)
			this.lastDirection = direction;

		let directionToEquator = {
			1: 'north',
			2: 'northEast',
			3: 'east',
			4: 'southEast',
			5: 'south',
			6: 'south',
			7: 'west',
			8: 'north',
		};

		let quadForm = {
			north: [[0, 0], [1, 0], [0, 1], [1, 1]], // north-west too
			northEast: [[0, 0], [-1, 0], [0, 1], [-1, 1]],
			south: [[0, 0], [1, 0], [0, -1], [1, -1]], // south-west too
			southEast: [[0, 0], [-1, 0], [0, -1], [-1, -1]],
			east: [[0, 0], [0, -1], [-1, 0], [-1, -1]],
			west: [[0, 0], [0, 1], [1, 0], [1, 1]],
		};

		if (direction === 0) {
			equator = directionToEquator[this.lastDirection];
			offset = quadForm[equator][creep.memberId];
		}
		else {
			equator = directionToEquator[direction];
			offset = quadForm[equator][creep.memberId];
		}

		let targetPosition = new RoomPosition(`equator: ${equator}, offset: ${offset}`, {
			x: target.x + offset[0],
			y: target.y + offset[1],
		});

		if (check) {
			return Util.sameCoord(creep.pos, targetPosition)
		} else
			return new CapturePoint(targetPosition, false);

	}

	positionReached(position) {
		// const members = this.members;
		// if (this.goalDefinition.length === 1)
		// 	return this.members.some(i => i.standsOn(position))
		// else
		// return members.some(i => i.standsOn(position));

		return this.leader.standsOn(position)

		// console.log(`group: ${this.name} standsOn: ${standsOn} spread: ${this.spread}`)


	}
}

export default Group;
