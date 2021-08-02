'use strict';

import * as utils from "/game/utils";
import * as prototypes from "/game/prototypes";
import * as constants from "/game/constants";
import * as arena from "/arena";

import {arenaInfo} from "/game";

import {getObjectsByPrototype, getTicks} from '/game/utils';

import Utils from './utils/utils.mjs';


class Game {
	constructor() {

		this.cache = {}
		this.cacheTick = 0
		// this.utils = gameModule.utils
		// this.prototypes = gameModule.prototypes
		// this.constants = gameModule.constants
		// this.arenaInfo = gameModule.arenaInfo
		// this.arena = arenaModule
		this.getProperties(arenaInfo)
	}

	getProperties(arenaInfo) {
		console.log(`getProperties running`)
		let modules = [utils, prototypes, arena, constants]
		if (!this.cache) {

			// [this.Utils, this.prototypes, this.arena, this.constants]
			// .forEach(module => Object.keys(module)
			// .forEach(property => this.cache[property] = module[property]
			// ))
			//

			modules.forEach(module => {
				Object.keys(module).forEach(property => {
					console.log(`module: ${module} property: ${property}`)
					this.cache[property] = module[property]
				})
			})

			this.arenaInfo = arenaInfo;
		}

		if (this.cacheTick !== getTicks()) {
			this.cacheTick = getTicks()
			this.arenaInfo = arenaInfo
		}
	}

	get display() {
		// let Constants = this.getAll('constants')
		// console.log(`Utils: ${Utils.json(Constants)}`)
		console.log(`Game.cache: ${Utils.json(this.cache)}`)
	}

	getAll(name) {
		// console.log(`cache: ${Utils.json(this.cache)}`)
		return getObjectsByPrototype(this.cache[name]);
	}
}



export default new Game()

