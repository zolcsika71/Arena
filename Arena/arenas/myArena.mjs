'use strict';

class myArena {

	get className() {
		return 'myArena'
	}

	get time() {
		return Game.getTicks();
	}

	get name() {
		return Game.name;
	}

	get level() {
		return Game.level;
	}

	get season() {
		return Game.season;
	}

	get ticksLimit() {
		return Game.ticksLimit;
	}

	get cpuTimeLimit() {
		return Game.cpuTimeLimit;
	}

	get cpuTimeLimitFirstTick() {
		return Game.cpuTimeLimitFirstTick;
	}

	get towers() {
		return Game.getAll('StructureTower');
	}

	get creeps() {
		return Game.getAll('Creep')
	}

	get myCreeps() {
		return this.creeps.filter(i => i.my);
	}

	get enemyCreeps() {
		return this.creeps.filter(i => !i.my);
	}

	start() {
	}

	update() {
	}

	toString() {
		return `${this.name} (${this.level}, ${this.season})`;
	}
}

export default myArena;
