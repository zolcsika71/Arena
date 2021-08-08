'use strict';

import _ from './lib/lodash-es/lodash';
import Game from './Game.mjs';
import Util from './utils/utils.mjs';
import Traveller from './utils/Traveller.mjs';
import Creep from './prototypes/creep.mjs';
import StructureTower from './prototypes/structureTower.mjs'
import {red, green, yellow} from './utils/color.mjs';
import GameManager from './GameManager.mjs';

global._ = _;
global.red = red
global.green = green
global.yellow = yellow

export function loop() {
	GameManager.loop();
}
