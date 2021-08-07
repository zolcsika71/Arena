'use strict';


class CapturePoint {
	constructor(position, stay = false) {
		this.position = position;
		this.stay = this.stayThere(stay);
	}

	stayThere(stay) {
		if (_.isFunction(stay))
			return stay();
		return stay;
	}
}

export default CapturePoint;
