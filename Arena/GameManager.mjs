'use strict';

import _ from './lib/lodash-es/lodash';

import Cache from './Cache.mjs';
import Stats from './utils/stats.mjs';
import Arena from './getArena.mjs';

import {arenaInfo, utils, prototypes, constants} from '/game';
import * as pathFinder from '/game/path-finder';
import * as arena from '/arena';
import Utils from './utils/utils.mjs';

global._ = _;

global.Game = {};
global.Game.Strategy = {}
global.Game.arenaInfo = {}
Object.assign(global.Game.Strategy, Arena.strategy);
Object.assign(global.Game.arenaInfo, arenaInfo);



import Traveller from './utils/Traveller.mjs';
//
// console.log(`Game.Utils: ${Utils.json(Game.Utils)}`)
// console.log(`Game.prototypes: ${Utils.json(Game.prototypes)}`)
// console.log(`Game.arena: ${Utils.json(Game.arena)}`)
// console.log(`Game.arenaInfo: ${Utils.json(Game.arenaInfo)}`)
// console.log(``)

class GameManager {

	constructor() {
		this.modules = [Cache, Arena, Game.Strategy, Stats];
	}

	setGame() {
		console.log(`set is running`);
		[utils, prototypes, pathFinder, arena]
		.forEach(module => {
			console.log(module);
			Object.keys(module).forEach(property => {
				// TODO check if isObj?
				console.log(`property: ${property.toString()}`)
				// global.Game = Object.assign({}, property);
				Object.assign(global.Game, property);

			})
		})
	}

	get isFirstTick() {
		return Arena.time === 1;
	}

	loop() {

		console.log(`Game: ${Utils.json(global.Game)}`)
		// let Utils = Game.getAll('creep')
		// console.log(`Utils: ${Utils.json(Utils)}`)
		// Game.display


		if (this.isFirstTick) {
			this.setGame()
			for (const module of this.modules) {
				if (_.isFunction(module.start))
					module.start();
			}
		} else {
			for (const module of this.modules) {
				if (_.isFunction(module.update))
					module.update();
			}
		}
	}


}

export default new GameManager();
