import Rect from './rect'
const direction = {
    up: 1,
    right: 2,
    down: 3,
    left: 4
}

/**
 * This class is responsible for the layout handling of an array of boxes to avoid boxes placed above each other or out of bounds
 */
export default class Layout {
    constructor(initialLayout, properties) {
        this.properties = properties
        this.initialized = false
        this.layout = initialLayout

        this.movingBox = null
    }

    /**
     * Returns available space in all directions from box point of view. Starts
     * @param  {} box
     */
    getFreeDirections(box) {
        let result = {
            left: 0,
            above: 0,
            right: 0,
            below: 0
        }

        let free = {
            left: true,
            above: true,
            right: true,
            below: true
        }
        for (let horizontal = 1; horizontal <= box.position.w; horizontal++) {
            let left = {
                ...box.position,
                x: box.position.x - box.position.w
            }

            let right = {
                ...box.position,
                x: box.position.x + box.position.w
            }

            free = {
                left: free.left && left.x >= 0 && this.isFree(left, box.id),
                right: free.right && right.x + right.w <= this.properties.maxColumnCount && this.isFree(right, box.id)
            }

            result.left = free.left ? horizontal : result.left
            result.right = free.right ? horizontal : result.right
        }

        for (let vertical = 1; vertical <= box.position.h; vertical++) {
            let above = {
                ...box.position,
                y: box.position.y - box.position.h
            }

            let below = {
                ...box.position,
                y: box.position.y + box.position.h
            }

            free = {
                above: free.above && above.y >= 0 && this.isFree(above, box.id),
                below: free.below && this.isFree(below, box.id) // No limits below
            }

            result.above = free.above ? vertical : result.above
            result.below = free.below ? vertical : result.below
        }

        return result
    }

    /**
     * check if 2 positions are colliding
     * @param  {} positionA
     * @param  {} positionB
     */
    positionsAreColliding(positionA, positionB) {
        let a = new Rect(positionA.x, positionA.y, positionA.w, positionA.h)
        let b = new Rect(positionB.x, positionB.y, positionB.w, positionB.h)
        return a.collide(b)
    }

    /**
     * check if position is free in layout
     * @param  {} position
     * @param  {} id
     */
    isFree(position, id) {
        var r2 = this.layout.filter(box => box.id !== id).some(box => {
            return this.positionsAreColliding(box.position, position)
        })
        return !r2
    }

    /**
     * sort layout based on position and visibility
     */
    sortLayout() {
        this.layout = [ ...this.layout ].sort((a, b) => {
            if (a.hidden && !b.hidden) {
                return 1
            }
            if (!a.hidden && b.hidden) {
                return -1
            }
            if (a.pinned && !b.pinned) {
                return -1
            }
            if (!a.pinned && b.pinned) {
                return 1
            }
            if (a.position.y < b.position.y) {
                return -1
            }
            if (a.position.y > b.position.y) {
                return 1
            }
            if (a.position.x < b.position.x) {
                return -1
            }
            if (a.position.x > b.position.x) {
                return 1
            }
            return 0
        })
    }

    /**
     * get box position in pixels
     */
    positionToPixels(position, cellSize, margin = 0, outerMargin = 0) {
        let result = {
            x: (position.x * cellSize.w) + ((position.x) * margin) + outerMargin,
            y: (position.y * cellSize.h) + ((position.y) * margin) + outerMargin,
            w: (position.w * cellSize.w) + ((position.w - 1) * margin),
            h: (position.h * cellSize.h) + ((position.h - 1) * margin)
        }
        return result
    }

    /**
     * get layout bounding box
     */
    getLayoutSize() {
        return {
            w: this.layout.reduce((width, boxLayout) => {
                return boxLayout.hidden
                    ? width
                    : Math.max(width, boxLayout.position.x + boxLayout.position.w)
            }, 0),
            h: this.layout.reduce((height, boxLayout) => {
                return boxLayout.hidden
                    ? height
                    : Math.max(height, boxLayout.position.y + boxLayout.position.h)
            }, 0)
        }
    }

    /**
     * check if layout has collisions
     */
    layoutHasCollisions() {
        return this.collisions().length > 0
    }

    /**
     * Return all collisions
     */
    collisions() {
        let result = []
        this.layout.forEach(box1 => {
            this.layout.forEach(box2 => {
                if (box1.id !== box2.id && this.positionsAreColliding(box1.position, box2.position)) {
                    result.push(box1, box2)
                }
            })
        })
        return result
    }

    /**
     * fix layout with collisions
     */
    fixLayout() {
        // TODO: Implement new
        let collided = this.collisions()
        let sorted = this.layout.sort((a, b) => {
            if (a.position.y < b.position.y) {
                return 1
            } else if (a.position.y > b.position.y) {
                return -1
            } else {
                if (a.position.x < b.position.x) {
                    return 1
                } else if (a.position.x > b.position.x) {
                    return -1
                }
            }
            return 0
        })
        return sorted + collided
    }

    /**
     * Commit movement
     */
    commit() {
        this.movingBox = null

        // Update originalPosition to current position
        this.layout.forEach(box => {
            box.originalPosition = Object.assign({}, box.position)
        })
    }

    /**
     * Reset to original position to make a new calculation. Otherwise widgets may be pushed to strange positions
     * @param  {} target
     */
    resetPositions(target) {
        this.layout.forEach(box => {
            if (box.id === target.id) {
                box.position = Object.assign({}, target.position)
                box.isProcessed = true
            } else {
                box.position = Object.assign({}, box.originalPosition)
                box.isProcessed = false
            }
        })
    }

    /**
     * Finds boxes with changes
     * @param  {} target
     */
    changes() {
        return this.layout.filter(w => JSON.stringify(w.position) !== JSON.stringify(w.originalPosition))
    }

    /**
     * Make target free
     * @param  {Widget} target
     */
    updatePositions(target) {
        return new Promise((resolve, reject) => {
            target.isProcessed = true
            this.movingBox = target
            if (!this.initialized) {
                this.initialized = true
                let temp = []
                this.layout.forEach(box => {
                    temp.push(box.copy())
                })
                this.layout = temp
            }

            this.resetPositions(target)

            this.layout.forEach(box => {
                let i = 100 // TODO: Protect forever loop during development
                while (this.collidingBoxes(box, [target]).length > 0 && (i--) > 0) {
                    this.recursiveMove(box, null, [target])
                    if (this.layoutHasCollisions()) {
                        this.layout.filter(b => b.id !== target.id).forEach(b => {
                            b.isProcessed = false
                        })
                    }
                }
            })
            resolve(this.layout)
        })
    }

    /**
     * Return array of boxes if they will collide with target
     * @param  {} box
     * @param  {} boxes
     */
    collidingBoxes(box, boxes) {
        let result = []
        boxes.forEach(target => {
            if (box.id !== target.id && this.positionsAreColliding(target.position, box.position)) {
                result.push(target)
            }
        })
        return result
    }

    /**
     * Recursivly move boxes to available position. If there are no space push down all non-moved boxes to make space
     * @param  {} box
     * @param  {} prefferedDirection
     * @param  {} targets
     */
    recursiveMove(box, prefferedDirection, targets) {
        let freeDirections = this.getFreeDirections(box)
        let movement = {
            left: freeDirections.left > targets[0].w ? targets[0].w : freeDirections.left,
            above: freeDirections.above > targets[0].h ? targets[0].h : freeDirections.above,
            right: freeDirections.right > targets[0].w ? targets[0].w : freeDirections.right,
            below: freeDirections.below > targets[0].h ? targets[0].h : freeDirections.below,
            horizontal: Math.max.apply(Math, targets.map(o => { return o.position.w })),
            vertical: 1 // Math.max.apply(Math, targets.map(o => { return o.position.h }))
        }

        box.isProcessed = true
        targets.push(box)

        if (prefferedDirection === direction.down && freeDirections.below >= box.position.h) {
            box.moveBox(prefferedDirection, movement.below)
        } else if (freeDirections.left >= box.position.w) {
            box.moveBox(direction.left, movement.left)
        } else if (freeDirections.above >= box.position.h) {
            box.moveBox(direction.up, movement.above)
        } else if (freeDirections.right >= box.position.w) {
            box.moveBox(direction.right, movement.right)
        } else if (freeDirections.below >= box.position.h) {
            box.moveBox(direction.down, movement.below)
        } else {
            if (!prefferedDirection) {
                prefferedDirection = direction.down
            }

            if (prefferedDirection % 2 === 0) {
                box.moveBox(prefferedDirection, movement.horizontal)
            } else {
                box.moveBox(prefferedDirection, movement.vertical)
            }

            // Move boxes that are colliding with current box
            let i = 100 // TODO: Protect forever loop during development
            var filtered = this.layout.filter(b => !b.isProcessed)
            while (this.collidingBoxes(box, filtered).length > 0 && (i--) > 0) {
                var cb = this.collidingBoxes(box, filtered)
                cb.forEach(b => {
                    b.isProcessed = true // Avoid moving around wrong boxes
                })
                cb.forEach(collidingBox => {
                    this.recursiveMove(collidingBox, prefferedDirection, targets)
                })
            }
        }
        this.updateLayout(box)
    }

    updateLayout(box) {
        this.layout = this.layout.map((b, index) => {
            if (b.id === box.id) {
                return box
            }
            return b
        })
    }

    setNewLayout(layout) {
        this.commit()
        this.layout = layout
        this.initialized = false
        this.movingBox = null
    }

    printLayoutTable() {
        let print = []
        for (let i = 0; i < this.layout.length; i++) {
            print.push({
                x: this.layout[i].position.x + ' (' + this.layout[i].originalPosition.x + ')',
                y: this.layout[i].position.y + ' (' + this.layout[i].originalPosition.y + ')',
                w: this.layout[i].position.w + ' (' + this.layout[i].originalPosition.w + ')',
                h: this.layout[i].position.h + ' (' + this.layout[i].originalPosition.h + ')'
            })
        }
        console.table(print)
    }
}
