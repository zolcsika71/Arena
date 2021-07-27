import {getRange} from '/game/utils'
import RoomPosition from '../roomPosition.mjs';


class Util {
	static brush = {
		death: {color: 'black', 'font-weight': 'bold'},
		birth: '#e6de99',
		error: '#e79da7',
		system: {color: '#999', 'font-size': '10px'},
	};

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
			return target
		else
			return new RoomPosition(name, {x: target.x, y: target.y})
	};

	isObj = function (val) {
		if (val === null)
			return false;
		return typeof val === 'function' || typeof val === 'object';
	};

	paint(style, text) {
		if (this.isObj(style)) {
			let css = '',
				format = key => css += key + ':' + style[key] + ';';
			_.forEach(Object.keys(style), format);
			return ('<font style="' + css + '">' + text + '</font>');
		}
		if (style)
			return ('<font style="color:' + style + '">' + text + '</font>');
		else return text;
	};

	logSystem(message) {
		console.log(`${this.paint(Util.brush.system, message)}`);
	}

	byRangeTo(position, reverse = false) {
		reverse === false ? reverse = 1 : reverse = -1
		return (a, b) => (getRange(a, position) - getRange(b, position)) * reverse
	}

	byHits(reverse = false) {
		reverse === false ? reverse = 1 : reverse = -1
		return (a, b) => (a.hits - b.hits) * reverse
	}

}


export default new Util();


