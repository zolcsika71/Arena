'use strict';

import myArena from './myArena.mjs';
import CaptureTheFlagBasic from '../strategies/CTF_basic.mjs';
import CaptureTheFlagAdvanced from '../strategies/CTF_advanced.mjs';
import RoomPosition from '../roomPosition.mjs';


class CaptureTheFlagArena extends myArena {

	constructor() {
		super();
		this._bridges = null;
	}

	get strategy() {
		if (this.level === 1)
			return new CaptureTheFlagBasic();
		else
			return new CaptureTheFlagAdvanced();

	}

	get bridges() {
		if (!this._bridges) {
			this._bridges = [
				new RoomPosition('Bridge-1', {x: 35, y: 65}),
				new RoomPosition('Bridge-2', {x: 65, y: 35}),
			];
		}

		return this._bridges;
	}

	get gatherPoints() {

	}

	get flags() {
		return Game.getAll('Flag');
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
		let position = new RoomPosition(`cornerPositionUpperLeft`, {x: 0, y: 0});

		if (flag.x !== 2) {
			position = new RoomPosition(`cornerPositionBottomRight`, {x: 98, y: 98});
		}

		return position;
	}

	get isBaseAtNorthWest() {
		return this.myCornerPosition.x === 1;
	}
}


export default CaptureTheFlagArena;
