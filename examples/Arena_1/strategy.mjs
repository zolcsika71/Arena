'use strict';

import {arenaInfo} from '/game';

import {basicCTF} from './CTF/CTF_basic.mjs';
import {advancedCTF} from './CTF/CTF_advanced.mjs';

import {basicSAS} from './SAS/SAS_basic.mjs';
import {advancedSAS} from './SAS/SAS_advanced.mjs';

import {basicCAC} from './CAC/CAC_basic.mjs';
import {advancedCAC} from './CAC/CAC_advanced.mjs';

function getStrategy() {
	console.log(`arena name: ${arenaInfo.name}`);

	let strategy;

	if (arenaInfo.name === 'Capture the Flag') {
		if (arenaInfo.level === 1)
			strategy = new basicCTF();
		else if (arenaInfo.level === 2)
			strategy = new advancedCTF();

	} else if (arenaInfo.name === 'Spawn and Swamp') {
		if (arenaInfo.level === 1)
			strategy = new basicSAS();
		else if (arenaInfo.level === 2)
			strategy = new advancedSAS();

	} else if (arenaInfo.name === 'Collect and Control') {
		if (arenaInfo.level === 1)
			strategy = new basicCAC();
		else if (arenaInfo.level === 2)
			strategy = new advancedCAC();

	} else
		throw(new Error(arenaInfo.name));


	return strategy;
}

export {getStrategy};
