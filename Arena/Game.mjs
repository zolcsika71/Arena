'use strict';

import {getObjectsByPrototype} from '/game/utils';

import {arenaInfo} from '/game';
import * as utils from '/game/utils';
import * as prototypes from '/game/prototypes';
import * as constants from '/game/constants';
import {CostMatrix, searchPath} from '/game/path-finder';
import * as arena from '/arena';

class Game {
	constructor(arenaInfo, utils, prototypes, constants, arena) {
		this.arenaInfo = arenaInfo;
		this.utils = utils;
		this.prototypes = prototypes;
		this.constants = constants;
		this.arena = arena;
		this.buildGame()
	}

	buildGame() {
		[this.arenaInfo, this.utils, this.prototypes, this.constants, this.arena]
		.forEach(module => {
			Object.keys(module).forEach(property => {
				if (!this[property] && property !== 'prototypes') {
					this[property] = module[property];
				}
			});
		});
		this.CostMatrix = CostMatrix
		this.searchPath = searchPath;
	}

	getAll(name) {
		return getObjectsByPrototype(this[name]);
	}
}

global.Game = new Game(arenaInfo, utils, prototypes, constants, arena);

export default global.Game
