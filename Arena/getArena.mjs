'use strict';

import {arenaInfo} from '/game';

import CaptureTheFlagArena from '/user/arenas/CTF_Arena.mjs';

let Arena;

switch (arenaInfo.name) {
	case 'Capture the Flag':
		Arena = CaptureTheFlagArena;
		break;

	case 'Spawn and Swamp':
		throw `unsupported arena: ${arenaInfo.name}`;

	default:
		throw `unsupported arena: ${arenaInfo.name}`;
}

export default new Arena();
