'use strict'

import _ from './lib/lodash-es/lodash'

import * as Game from "/game";
import * as Arena from "/arena";

import Util from './utils/utils.mjs'
import Arena from './getArena.mjs'
import Cache from './Cache.mjs'
import Stats from './utils/stats.mjs'
import {red, green, yellow} from './utils/color.mjs';
import Traveller from './utils/Traveller.mjs';


class GameManager {
	constructor() {
		for (let globalKey in constants)
				global[globalKey] = constants[globalKey]

		global._ = _
		global.Strategy = Arena.strategy
		global.Util = Util
		global.red = red


		this.modules = [Cache, Arena, Strategy, Stats]

	}
	get isFirstTick() {
		return Arena.time === 1
	}

	loop() {
		if (this.isFirstTick) {
			for (const module of this.modules) {
				if (_.isFunction(module.start)) {
					module.start()
				}
			}
		} else {
			for (const module of this.modules) {
				if (_.isFunction(module.update)) {
					module.update()
				}
			}
		}
	}
}

export default new GameManager()
