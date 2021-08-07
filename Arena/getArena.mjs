'use strict';

import CaptureTheFlagArena from '/user/arenas/CTF_Arena.mjs';

let Arena;

switch (Game.name) {
	case 'Capture the Flag':
		Arena = CaptureTheFlagArena;
		break;

	case 'Spawn and Swamp':
		throw `unsupported arena: ${Game.name}`;

	default:
		throw `unsupported arena: ${Game.name}`;
}

global.Arena = new Arena();

export default global.Arena
