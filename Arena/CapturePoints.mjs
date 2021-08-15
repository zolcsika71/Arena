'use strict';


class CapturePoint {
	constructor(position, ignoreCreeps = true) {
		this.position = position;
		this.x = position.x
		this.y = position.y
		this.ignoreCreeps = ignoreCreeps
	}
	// https://stackoverflow.com/questions/13286233/pass-a-javascript-function-as-parameter
	stayThere(callback, args) {
		if (_.isFunction(callback))
			callback.apply(this, args);
		return callback;
	}

	toString() {
		return `[${green(this.position.name)}] x: ${yellow(this.x)}, y: ${yellow(this.y)}, cost: ${yellow(this.position.cost)}`;
	}
}

export default CapturePoint;
