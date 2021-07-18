'use strict'

class RoomPosition {
    constructor(name, position) {
        this.name = name
        this.x = position.x
        this.y = position.y
    }

    toString() {
        return `[${this.name}] ${this.x}, ${this.y}`
    }
}

export default RoomPosition
