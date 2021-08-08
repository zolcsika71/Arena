'use strict';

import GameCache from './Cache.mjs';
import Stats from './utils/stats.mjs';
import Arena from './getArena.mjs';

global.Strategy = Arena.strategy;

class GameManager {
	constructor() {
		this.modules = [GameCache, Arena, Strategy, Stats];
	}

	get isFirstTick() {
		return Arena.time === 1;
	}

	loop() {
		if (this.isFirstTick) {
			for (const module of this.modules) {
				if (_.isFunction(module.start)) {
					module.start();
				}
			}
		} else {
			for (const module of this.modules) {
				if (_.isFunction(module.update)) {
					module.update();
				}
			}
		}
	}
}

export default new GameManager();
