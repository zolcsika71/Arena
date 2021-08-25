'use strict';


import TestModules from './testModules.mjs';

class Test {
	constructor(GamePropertyType, testFunction) {

		this.GamePropertyType = {
			enable: false,
			type: GamePropertyType || null,
			run: function () {
				Util.printGame(this.type)
			}
		};
		this.testFunction = {
			enable: false,
			module: testFunction || 'skip',
			run: function () {
				TestModules[this.module]();
			}
		};
		this.modules = [this.GamePropertyType, this.testFunction]
		this.enabled = this.enableTest;


	}

	get enableTest() {
		for (const module of this.modules) {
			if (module.enable) {
				return true;
			}
		}
	}
}

export default Test;
