'use strict';


import {getStrategy} from './strategy.mjs';
import _ from './lib/lodash-es/lodash.js';
import {json} from './utils.mjs';
import Parameters from './parameters.mjs';

export function loop() {

	let strategy = getStrategy();
	strategy.run();

	// console.log(`tick: ${global.utils.getTicks()}`)

	// for (let key in globals.utils)
	//     console.log(`utils: ${globals.utils[key]}`)
	// for (let key in globals.prototypes)
	//     console.log(`prototypes: ${globals.prototypes[key]}`)


}
