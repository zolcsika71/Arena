'use strict'

import {getDirection} from '/game/utils';
import {getObjectsByPrototype} from '/game/utils';
import {GameObject} from '/game/prototypes/'

class RoomPosition {
    constructor(name, position) {
        this.name = name
        this.pos = position
        this.x = position.x
        this.y = position.y
    }
    // TODO write it
    getRangeTo = function (target) {
        return 100
    }

    standsOn = function (position) {
        // return position.x === this.x && position.y === this.y;
        return _.isEqual(this.pos, position);
    };

    inRangeTo = function (target, range) {
        return this.getRangeTo(target) <= range;
    };

    isNearTo = function (target) {
        return this.inRangeTo(target, 1)
    }

    getDirectionTo = function (target) {
        return getDirection(target.x - this.x, target.y - this.y)
    }

    toString() {
        return `[${this.name}] ${this.x}, ${this.y}`
    }
}

export default RoomPosition
