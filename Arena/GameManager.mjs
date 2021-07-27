'use strict'

import * as constants from '/game/constants'
import _ from '/user/lib/lodash-es/lodash'

import Util from '/user/utils/utils.mjs'
import Arena from '/user/getArena.mjs'
import Cache from './Cache.mjs'
import Stats from './utils/stats.mjs'
import Traveller from './utils/Traveller.mjs';


class GameManager {
	constructor() {
		for (let globalKey in constants)
				global[globalKey] = constants[globalKey]

		global._ = _

		global.Strategy = Arena.strategy

		this.modules = [Cache, Arena, Strategy, Stats]

	}
	get isFirstTick() {
		return Arena.time === 1
	}

	loop() {
		if (this.isFirstTick) {
			for (const module of this.modules) {
				// console.log(`module: ${module.className}`)
				if (_.isFunction(module.start)) {
					module.start()
				}
			}
		} else {
			for (const module of this.modules) {
				// console.log(`module: ${module.className}`)
				if (_.isFunction(module.update)) {
					module.update()
				}
			}
		}
	}
}

export default new GameManager()
