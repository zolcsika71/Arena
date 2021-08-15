'use strict'

import Component from './component.mjs'

class IdleAction extends Component {
	constructor(creep) {
		super();
		this.name = 'idle'
		this.creep = creep
	}

	update() {
		// super.update();
	}
}

export default IdleAction
