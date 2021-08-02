'use strict';


import CaptureTheFlagArena from '/user/arenas/CTF_Arena.mjs';
import utils from './utils/utils.mjs';

// console.log(`arenaInfo: ${Utils.json(Game)}`)
//
// let Arena;
//
// switch (Game.arenaInfo.name) {
// 	case 'Capture the Flag':
// 		Arena = CaptureTheFlagArena;
// 		break;
//
// 	case 'Spawn and Swamp':
// 		throw `unsupported arena: ${Game.arenaInfo.name}`;
//
// 	default:
// 		throw `unsupported arena: ${Game.arenaInfo.name}`;
// }
//
// export default new Arena();

export default new CaptureTheFlagArena()
