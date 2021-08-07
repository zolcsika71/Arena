'use strict';

const prototype = Game.StructureTower.prototype;

Object.defineProperties(prototype, {
	'isWounded': {
		get: function () {
			return this.hits < this.hitsMax;
		},
		configurable: true,
	},
});

prototype.start = function () {
};

prototype.update = function () {
	const attackRange = Game.TOWER_OPTIMAL_RANGE + 5;
	const enemiesInRange = Arena.enemyCreeps
	.filter(i => i.inRangeTo(this, attackRange) && i.canMove)
	.sort(Util.byHits());

	if (enemiesInRange.length > 0) {
		let target = enemiesInRange[0];
		this.attack(target);
		return;
	}

	const healRange = Game.TOWER_RANGE;
	const healTargets = Arena.myCreeps
	.filter(i => i.isWounded && i.inRangeTo(this, healRange))
	.sort(Util.byHits());

	if (healTargets.length > 0) {
		let target = healTargets[0];
		this.heal(target);
	}
};

prototype.toString = function () {
	return `[${this.constructor.name}] ${this.x}, ${this.y}`;
};

export default Game.StructureTower;
