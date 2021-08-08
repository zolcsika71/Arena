'use strict';


import RoomPosition from '../roomPosition.mjs';

import HealerWeapon from '../weapon/healerWeapon.mjs';
import MeleeWeapon from '../weapon/meleeWeapon.mjs';
import RangedWeapon from '../weapon/rangedWeapon.mjs';

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
	'position': {
		get: function () {
			return new RoomPosition(this.id, {
				x: this.x,
				y: this.y,
			});
		},
		configurable: true,
	},
});

prototype.toString = function () {
	const faction = this.my ? 'Friend' : 'Enemy';
	return `[${faction}, {id: ${this.id}, role: ${this.role}, x: ${this.x}, y: ${this.y}}]`;
};

prototype.start = function (actions = []) {
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

	let result = Game.searchPath(origin, goals, options);

	if (result.path.length > 0) {
		let direction = Game.getDirection(result.path[0].x - this.x, result.path[0].y - this.y);
		this.move(direction);
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
