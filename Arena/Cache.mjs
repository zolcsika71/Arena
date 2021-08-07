'use strict'

class Cache {
	constructor() {
		this.cache = new Set()
	}

	get className() {
		return 'Cache'
	}

	has(cacheKey) {
		this.cache.has(cacheKey)
	}

	add(cacheKey) {
		this.cache.add(cacheKey)
	}

	update() {
		this.cache.clear()
	}
}

global.Cache = new Cache();

export default global.Cache;
