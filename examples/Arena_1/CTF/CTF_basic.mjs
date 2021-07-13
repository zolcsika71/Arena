'use strict';

import {getTicks} from '/game/utils';
import * as Constants from '/game/constants'
import Parameters from '../parameters.mjs';

import {myCreeps} from '../Creeps.mjs';

let Creeps = new myCreeps();


import {json} from '../utils.mjs';


class basicCTF {
	run() {
		console.log(`basic_CTF`);
		if (getTicks() === 1) {
			Creeps.getMyCreeps();
		}
		// this.display();
		// Creeps.melee[0].move(Parameters.directions.RIGHT)
		Creeps.melee[0].move(Constants.RIGHT)
		Creeps.melee[1].move(3)



	}

	display() {
		console.log(`tick: ${getTicks()}`);
		console.log(`hauler length: ${Creeps.hauler.length}`);
		console.log(`worker length: ${Creeps.worker.length}`);
		console.log(`melee length: ${Creeps.melee.length}`);
		console.log(`ranger length: ${Creeps.ranger.length}`);
		console.log(`healer length: ${Creeps.healer.length}`);
	}
}

export {basicCTF};
