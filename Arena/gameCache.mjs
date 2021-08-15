'use strict'

class GameCache {
	constructor() {
		this.cache = new Set()
	}

	get className() {
		return 'GameCache'
	}

	has(cacheKey) {
		return this.cache.has(cacheKey)
	}

	add(cacheKey) {
		this.cache.add(cacheKey)
	}

	update() {
		this.cache.clear()
	}
}

global.GameCache = new GameCache();

export default global.GameCache;
