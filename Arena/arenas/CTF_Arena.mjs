'use strict';

import {getObjectsByPrototype} from '/game/utils';
import {Flag} from '/arena';

import Arena from '/user/arenas/arena';
import CaptureTheFlagBasic from '/user/strategies/CTF_basic.mjs';
import CaptureTheFlagAdvanced from '/user/strategies/CTF_advanced.mjs';

import * as utils from '/user/utils/utils.mjs';

class CaptureTheFlagArena extends Arena {
	get strategy() {
		if (this.level === 1)
			return new CaptureTheFlagBasic();
		else
			return new CaptureTheFlagAdvanced();

	}


	get flags() {
		return getObjectsByPrototype(Flag);
	}

	get myFlag() {
		return this.flags.find(i => i.my);
	}

	get enemyFlag() {
		return this.flags.find(i => !i.my);
	}

	get myTower() {
		return this.towers.find(i => i.my);
	}

	get enemyTower() {
		return this.towers.find(i => !i.my);
	}

	get myCornerPosition() {
		return this.cornerPosition(this.myFlag);
	}

	cornerPosition(flag) {
		let position = {x: 1, y: 1};

		if (flag.x !== 2) {
			position = {x: 98, y: 98};
		}

		return position;
	}
}


export default CaptureTheFlagArena;
