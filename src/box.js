const direction = {
    up: 1,
    right: 2,
    down: 3,
    left: 4
}
export default class Box {
    constructor(box) {
        this.dashboardCompatibility = box.dashboardCompatibility
        this.address = box.address
        this.hidden = box.hidden
        this.id = box.id
        this.minSize = box.minSize
        this.pinned = box.pinned
        this.position = box.position
        this.title = box.title
        this.description = box.description
        this.type = box.type
        this.originalPosition = Object.assign({}, box.position)
        this.isProcessed = false // If set to true this box will be ignored when moving around boxes
    }

    moveBox(vector, distance = 1) {
        if (vector === direction.left) {
            this.position.x -= distance
        } else if (vector === direction.up) {
            this.position.y -= distance
        } else if (vector === direction.right) {
            this.position.x += distance
        } else if (vector === direction.down) {
            this.position.y += distance
        }
    }

    // reactive box layout update
    updateBoxLayout(data) {
        return {
            ...this,
            ...data
        }
    }

    // reactive box position update
    updateBoxPosition(data) {
        return this.updateBoxLayout({
            position: {
                ...this.position,
                ...data
            }
        })
    }
}
