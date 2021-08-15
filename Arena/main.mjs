'use strict';

import _ from './lib/lodash-es/lodash';
import Game from './Game.mjs';
import Util from './utils/utils.mjs';
import Traveller from './utils/Traveller.mjs';
import Creep from './prototypes/creep.mjs';
import StructureTower from './prototypes/structureTower.mjs';
import {red, green, yellow, blue, magenta, cyan, style} from './utils/color.mjs';
import GameManager from './GameManager.mjs';
import Test from './test/Test.mjs'

const test = new Test(null, 'move')
const gameManager = new GameManager(test)

global._ = _;
global.red = red;
global.green = green;
global.yellow = yellow;
global.blue = blue;
global.magenta = magenta;
global.cyan = cyan;
global.style = style;



export function loop() {
	// console.log(`test: ${Util.json(test)}`);
	gameManager.loop();
}
