'use strict'

import {getDirection} from '/game/utils';
import {getObjectsByPrototype} from '/game/utils';


class RoomPosition {
    constructor(name, position) {
        this.name = name
        this.pos = position
        this.x = position.x
        this.y = position.y
    }


    // standsOn = function (position) {
    //     // return position.x === this.x && position.y === this.y;
    //     return _.isEqual(this.pos, position);
    // };

    isNearTo = function (target) {
        let offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1],
            offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
        for (let i = 0; i < 9; i++) {
            if (target.x + offsetX[i] === this.x && target.y + offsetY[i] === this.y)
                return true
        }

        return false
    }

    getDirectionTo = function (target) {
        return getDirection(target.x - this.x, target.y - this.y)
    }

    toString() {
        return `[${this.name}] ${this.x}, ${this.y}`
    }
}

export default RoomPosition
