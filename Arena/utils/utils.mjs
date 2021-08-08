'use strict';

// import {getRange} from '/game/utils';
import RoomPosition from '../roomPosition.mjs';

class Util {

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

}

global.Util = new Util();
export default global.Util




