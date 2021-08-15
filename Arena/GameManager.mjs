'use strict';

import GameCache from './gameCache.mjs';
import Stats from './utils/stats.mjs';
import Arena from './getArena.mjs';
import Visuals from './visuals.mjs'


global.Strategy = Arena.strategy;

class GameManager {
	constructor(test) {
		this.modules = [GameCache, Arena, Strategy, Stats, Visuals];
		this.test = test;
	}

	get isFirstTick() {
		return Arena.time === 1;
	}

	loop() {
		console.log(`test: ${this.test.enabled}`);
		if (this.test.enabled) {
			_.forEach(this.test.modules, module => {
				console.log(`${Util.json(module)}`);
				if (typeof module.run === 'function' && module.enabled)
					module.run();
			})

		} else {
			if (this.isFirstTick) {
				for (const module of this.modules)
					if (module.start)
						module.start();
			} else {
				for (const module of this.modules)
					if (module.update)
						module.update();
			}
		}
	}
}

export default GameManager;
