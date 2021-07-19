'use strict';

import {getDirection} from '/game/utils';

import {searchPath} from '/game/path-finder';

import {Creep} from '/game/prototypes';

import RoomPosition from '../roomPosition.mjs';

import HealerWeapon from '../weapon/healerWeapon.mjs'
import MeleeWeapon from '../weapon/meleeWeapon.mjs'
import RangedWeapon from '../weapon/rangedWeapon.mjs'

import Arena from '../getArena.mjs'

import Traveller from '../utils/Traveller.mjs';


const prototype = Creep.prototype;

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
			return this.body.some(i => i.type === ATTACK);
		},
		configurable: true,
	},
	'isRanged': {
		get: function () {
			return this.body.some(i => i.type === RANGED_ATTACK);
		},
		configurable: true,
	},
	'isHealer': {
		get: function () {
			return this.body.some(i => i.type === HEAL);
		},
		configurable: true,
	},
	'canMove': {
		get: function () {
			return this.body.some(i => i.type === MOVE && i.hits > 0);
		},
		configurable: true,
	},
	'canAttack': {
		get: function () {
			return this.body.some(i => (i.type === ATTACK || i.type === RANGED_ATTACK) && i.hits > 0);
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
			let bodyParts = {}
			for (let bodyPart of this.body) {
				switch (bodyPart.type) {
					case MOVE:
						if (!bodyParts.move)
							bodyParts.move = 1
						else
							bodyParts.move += 1
						break
					case WORK:
						if (!bodyParts.work)
							bodyParts.work = 1
						else
							bodyParts.work += 1
						break
					case CARRY:
						if (!bodyParts.carry)
							bodyParts.carry = 1
						else
							bodyParts.carry += 1
						break
					case ATTACK:
						if (!bodyParts.attack)
							bodyParts.attack = 1
						else
							bodyParts.attack += 1
						break
					case RANGED_ATTACK:
						if (!bodyParts.ranged_attack)
							bodyParts.ranged_attack = 1
						else
							bodyParts.ranged_attack += 1
						break
					case HEAL:
						if (!bodyParts.heal)
							bodyParts.heal = 1
						else
							bodyParts.heal += 1
						break
					case TOUGH:
						if (!bodyParts.tough)
							bodyParts.tough = 1
						else
							bodyParts.tough += 1
						break
				}
			}

			return bodyParts
		},
		configurable: true,
	},
	'position': {
		get: function () {
			return new RoomPosition(this.id, {
				x: this.x,
				y: this.y
			})
		},
		configurable: true,
	}
});

prototype.toString = function () {
	const faction = this.my ? 'friend' : 'enemy';
	return `[${this.constructor.name}:${faction}] ${this.x},${this.y}`;
};

prototype.start = function (actions=[]) {
	this.actions = actions;
	for (const action of actions) {
		action.start();
	}
};

prototype.update = function () {
	for (const action of this.actions) {
		action.update();
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

	let result = searchPath(origin, goals, options);

	if (result.path.length > 0) {
		let direction = getDirection(result.path[0].x - this.x, result.path[0].y - this.y);

		this.move(direction);
	}
};

prototype.standsOn = function (position) {
	// return position.x === this.x && position.y === this.y;
	return _.isEqual(this.position, position);
};


prototype.inRangeTo = function (target, range) {
	return this.getRangeTo(target) <= range;
};

// prototype.getDirectionTo = function (target) {
// 	return getDirection(target.x - this.x, target.y - this.y)
// }
//
// prototype.isNearTo = function (target) {
// 	return this.inRangeTo(target, 1)
// }


export default Creep;
