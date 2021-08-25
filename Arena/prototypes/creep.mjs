'use strict';


import RoomPosition from '../roomPosition.mjs';

import HealerWeapon from '../weapon/healerWeapon.mjs';
import MeleeWeapon from '../weapon/meleeWeapon.mjs';
import RangedWeapon from '../weapon/rangedWeapon.mjs';
import {green, yellow} from '../utils/color.mjs';

const prototype = Game.Creep.prototype;

Object.defineProperties(prototype, {
	'isDead': {
		get: function () {
			return !this.exists;
		},
		configurable: true,
	},
	'isWounded': {
		get: function () {
			return this.hits < this.hitsMax;
		},
		configurable: true,
	},
	'isMelee': {
		get: function () {
			return this.body.some(i => i.type === Game.ATTACK);
		},
		configurable: true,
	},
	'isRanged': {
		get: function () {
			return this.body.some(i => i.type === Game.RANGED_ATTACK);
		},
		configurable: true,
	},
	'isHealer': {
		get: function () {
			return this.body.some(i => i.type === Game.HEAL);
		},
		configurable: true,
	},
	'canMove': {
		get: function () {
			return this.body.some(i => i.type === Game.MOVE && i.hits > 0);
		},
		configurable: true,
	},
	'canAttack': {
		get: function () {
			return this.body.some(i => (i.type === Game.ATTACK || i.type === Game.RANGED_ATTACK) && i.hits > 0);
		},
		configurable: true,
	},
	'weapon': {
		get: function () {
			switch (true) {
				case this.isRanged:
					return new RangedWeapon(this);
				case this.isMelee:
					return new MeleeWeapon(this);
				case this.isHealer:
					return new HealerWeapon(this);
			}
		},
		configurable: true,
	},
	'group': {
		get: function () {
			return this._group;
		},
		set: function (value) {
			this._group = value;
		},
		configurable: true,
	},
	'bodyParts': {
		get: function () {
			let bodyParts = {};
			for (let bodyPart of this.body) {
				switch (bodyPart.type) {
					case Game.MOVE:
						if (!bodyParts.move)
							bodyParts.move = 1;
						else
							bodyParts.move += 1;
						break;
					case Game.WORK:
						if (!bodyParts.work)
							bodyParts.work = 1;
						else
							bodyParts.work += 1;
						break;
					case Game.CARRY:
						if (!bodyParts.carry)
							bodyParts.carry = 1;
						else
							bodyParts.carry += 1;
						break;
					case Game.ATTACK:
						if (!bodyParts.attack)
							bodyParts.attack = 1;
						else
							bodyParts.attack += 1;
						break;
					case Game.RANGED_ATTACK:
						if (!bodyParts.ranged_attack)
							bodyParts.ranged_attack = 1;
						else
							bodyParts.ranged_attack += 1;
						break;
					case Game.HEAL:
						if (!bodyParts.heal)
							bodyParts.heal = 1;
						else
							bodyParts.heal += 1;
						break;
					case Game.TOUGH:
						if (!bodyParts.tough)
							bodyParts.tough = 1;
						else
							bodyParts.tough += 1;
						break;
				}
			}

			return bodyParts;
		},
		configurable: true,
	},
	'pos': {
		get: function () {
			return new RoomPosition(this.id, {
				x: this.x,
				y: this.y,
			});
		},
		configurable: true,
	},
	'getId': {
		get: function () {
			return parseInt(this.id, 10);
		},
		configurable: true,
	}
});

prototype.toString = function () {
	const faction = this.my ? 'Friend' : 'Enemy';
	return `[${yellow(faction)}, {group: ${yellow(this.group.name)}, id: ${yellow(this.id)}, memberId: ${yellow(this.memberId)}, role: ${yellow(this.role)}, x: ${yellow(this.x)}, y: ${yellow(this.y)}}]`;
};

prototype.start = function (actions = []) {
	this.travel = {
		path: '',
		reversePath: '',
		destination: undefined,
		state: {
			tick: 0,
			stuckCount: 0,
			lastPos: undefined,
			nextPos: undefined,
		},
		searchPath: {
			ops: undefined,
			cost: undefined,
			incomplete: undefined,
			move: undefined,
			options: undefined,
		},
	};
	this.actions = actions;
	this.executedActions = [];
	for (const action of actions) {
		if (action.start() === Game.OK)
			this.executedActions.push(action.name)
	}
};

prototype.update = function () {
	this.executedActions = [];
	for (const action of this.actions) {
		if (action.update() === Game.OK)
			this.executedActions.push(action.name)
	}
};

prototype.flee = function (targets, range) {
	if (range <= 1)
		return;

	let origin = this;
	let goals = targets.map(i => ({pos: i, range}));
	let options = {
		flee: true,
	};

	let result = Game.searchPath(origin, goals, options);

	if (result.path.length > 0) {
		let direction = Game.getDirection(result.path[0].x - this.x, result.path[0].y - this.y);
		return this.move(direction);
	}
};

prototype.standsOn = function (position) {
	return Util.sameCoord(this, position)
};

prototype.standsNear = function (position) {
	let target = Util.getRoomPosition('target,', position);
	return target.isNearTo(this);
};

prototype.inRangeTo = function (target, range) {
	return Game.getRange(this, target) <= range;
};


export default Game.Creep;
