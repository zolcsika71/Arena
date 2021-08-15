'use strict';


class TestModules {

	skip() {
		console.log(`skip`);
	}

	move() {
		console.log(`move`);
	}

}

export default new TestModules();
