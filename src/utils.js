// reactive box layout update
export const updateBoxLayout = (boxLayout, data) => {
    return {
        ...boxLayout,
        ...data
    }
}

// reactive box position update
export const updateBoxPosition = (boxLayout, data) => {
    return updateBoxLayout(boxLayout, {
        position: {
            ...boxLayout.position,
            ...data
        }
    })
}

// check if 2 positions are colliding
export const positionsAreColliding = (positionA, positionB) => {
    return positionA.x < (positionB.x + positionB.w) &&
        (positionA.x + positionA.w) > positionB.x &&
        positionA.y < (positionB.y + positionB.h) &&
        (positionA.y + positionA.h) > positionB.y
}

// check if position is free in layout
export const isFree = (layout, position) => {
    for (let i = 0; i < layout.length; i++) {
        if (positionsAreColliding(layout[i].position, position)) {
            return false
        }
    }
    return true
}

// moves the box to the upmost free position
export const bubbleUp = (layout, boxLayout) => {
    do {
        boxLayout = updateBoxPosition(boxLayout, {
            y: boxLayout.position.y - 1
        })
    } while (isFree(layout, boxLayout.position) && boxLayout.position.y >= 0)
    return updateBoxPosition(boxLayout, {
        y: boxLayout.position.y + 1
    })
}

// updates box position to a free place in a given layout
export const moveBoxToFreePlace = (layout, boxLayout, doBubbleUp) => {
    if (doBubbleUp) {
        boxLayout = bubbleUp(layout, boxLayout)
    }
    while (!isFree(layout, boxLayout.position)) {
        boxLayout = updateBoxPosition(boxLayout, {
            y: boxLayout.position.y + 1
        })
    }
    return boxLayout
}

// sort layout based on position and visibility
export const sortLayout = (layout) => {
    return [ ...layout ].sort((a, b) => {
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

// moves all boxes to the upmost free position
export const layoutBubbleUp = (layout) => {
    layout = sortLayout(layout)
    let newLayout = []
    layout.forEach(boxLayout => {
        newLayout.push(bubbleUp(newLayout, boxLayout))
    })
    return newLayout
}

// get box position in pixels
export const positionToPixels = (position, cellSize, margin = 0, outerMargin = 0) => {
    return {
        x: (position.x * cellSize.w) + ((position.x) * margin) + outerMargin,
        y: (position.y * cellSize.h) + ((position.y) * margin) + outerMargin,
        w: (position.w * cellSize.w) + ((position.w - 1) * margin),
        h: (position.h * cellSize.h) + ((position.h - 1) * margin)
    }
}

// get layout bounding box
export const getLayoutSize = (layout) => {
    return {
        w: layout.reduce((width, boxLayout) => {
            return boxLayout.hidden
                ? width
                : Math.max(width, boxLayout.position.x + boxLayout.position.w)
        }, 0),
        h: layout.reduce((height, boxLayout) => {
            return boxLayout.hidden
                ? height
                : Math.max(height, boxLayout.position.y + boxLayout.position.h)
        }, 0)
    }
}

// check if element matches a selector
// https://davidwalsh.name/element-matches-selector
export const matchesSelector = (el, selector) => {
    var p = Element.prototype
    var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
        return [].indexOf.call(document.querySelectorAll(s), this) !== -1
    }
    return f.call(el, selector)
}

// check if layout has collisions
export const layoutHasCollisions = (layout) => {
    for (let i = 0; i < layout.length; i++) {
        for (let j = i + 1; j < layout.length; j++) {
            if (positionsAreColliding(layout[i].position, layout[j].position)) {
                return true
            }
        }
    }
    return false
}

// fix layout with collisions
export const fixLayout = (layout, doBubbleUp) => {
    layout = sortLayout(layout)
    let fixedLayout = []
    layout.forEach(boxLayout => {
        fixedLayout.push(moveBoxToFreePlace(fixedLayout, boxLayout, doBubbleUp))
    })
    return fixedLayout
}
