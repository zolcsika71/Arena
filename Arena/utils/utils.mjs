'use strict';

import RoomPosition from '../roomPosition.mjs';

class Util {

	printGame(property = null) {
		if (property === null)
			Object.keys(Game).forEach(property => {
				console.log(property, Game[property])
			})
		else
			console.log(`${property}: ${Game[property]}`)
	}

	json(x) {
		return JSON.stringify(x, null, 2);
	}

	guid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	translateErrorCode(code) {
		const codes = {
			0: 'OK',
			1: 'ERR_NOT_OWNER',
			2: 'ERR_NO_PATH',
			3: 'ERR_NAME_EXISTS',
			4: 'ERR_BUSY',
			5: 'ERR_NOT_FOUND',
			6: 'ERR_NOT_ENOUGH_RESOURCES/ENERGY/EXTENSIONS',
			7: 'ERR_INVALID_TARGET',
			8: 'ERR_FULL',
			9: 'ERR_NOT_IN_RANGE',
			10: 'ERR_INVALID_ARGS',
			11: 'ERR_TIRED',
			12: 'ERR_NO_BODYPART',
		};
		return codes[code * -1];
	};

	getRoomPosition(name, target) {
		if (target instanceof RoomPosition)
			return target;
		else
			return new RoomPosition(name, {x: target.x, y: target.y});
	};

	sameCoord(pos1, pos2) {
		return pos1.x === pos2.x && pos1.y === pos2.y;
	}

	byRangeTo(position, reverse = false) {
		reverse === false ? reverse = 1 : reverse = -1;
		return (a, b) => (Game.getRange(a, position) - Game.getRange(b, position)) * reverse;
	}

	byHits(reverse = false) {
		reverse === false ? reverse = 1 : reverse = -1;
		return (a, b) => (a.hits - b.hits) * reverse;
	}

	directionToString(direction) {
		let directionToEquator = {
			1: 'north',
			2: 'northEast',
			3: 'east',
			4: 'southEast',
			5: 'south',
			6: 'southWest',
			7: 'west',
			8: 'northWest',
		};

		return directionToEquator[direction];
	}

	/**
	 * Returns the result of the function or the value passed
	 * @param {*} value
	 * @param {...*} [args] - A list of arguments to pass if it's a function
	 * @returns {*}
	 */
	fieldOrFunction(value, ...args) {
		return typeof value === 'function' ? value(...args) : value;
	}

	/**
	 * Gets a property from an object and optionally sets the default
	 * @param {Object} object - The object
	 * @param {string} path - The path to the property within the object
	 * @param {*} defaultValue - The default value if property doesn't exist
	 * @param {Boolean} [setDefault=true] - Will set the property to the default value if property doesn't exist
	 * @returns {*}
	 */
	get(object, path, defaultValue, setDefault = true) {
		const r = _.get(object, path);
		if (_.isUndefined(r) && !_.isUndefined(defaultValue) && setDefault) {
			defaultValue = this.fieldOrFunction(defaultValue);
			_.set(object, path, defaultValue);
			return _.get(object, path);
		}
		return r;
	}

	/**
	 * Sets a property on an object, optionally if the property doesn't already exist
	 * @param {Object} object - The object
	 * @param {string} path - The path to the property within the object
	 * @param {*} value - The value to set
	 * @param {Boolean} [onlyIfNotExists=true] - Will only set the property if it doesn't already exist
	 */
	set(object, path, value, onlyIfNotExists = true) {
		if (onlyIfNotExists) {
			this.get(object, path, value);
			return;
		}
		_.set(object, path, value);
	}

}

global.Util = new Util();
export default global.Util




