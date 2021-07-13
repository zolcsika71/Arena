'use strict'

import * as constants from '/game/constants'
import _ from '/user/lib/lodash-es/lodash'

import Util from '/user/utils/utils.mjs'
import Arena from '/user/getArena.mjs'
import Cache from '/user/modules/Cache.mjs'


class GameManager {
	constructor() {
		for (let globalKey in constants)
			global[globalKey] = constants[globalKey]

		global._ = _

		this.modules = [Cache, Arena, Arena.strategy]

	}
	get isFirstTick() {
		return Arena.time === 1
	}

	loop() {
		if (this.isFirstTick) {
			console.log(`first tick:`)
			for (const module of this.modules) {
				// console.log(`module: ${module.className}`)
				if (typeof module.start === 'function') {
					module.start()
				}
			}
		} else {
			console.log(`LOOP`)
			for (const module of this.modules) {
				// console.log(`module: ${module.className}`)
				if (typeof module.update === 'function') {
					module.update()
				}
			}
		}
	}
}

export default new GameManager()
