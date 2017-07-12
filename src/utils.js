export const isFree = (layout, position) => {
    for (let i = 0; i < layout.length; i++) {
        if (layout[i].position.x < (position.x + position.w) &&
            (layout[i].position.x + layout[i].position.w) > position.x &&
            layout[i].position.y < (position.y + position.h) &&
            (layout[i].position.y + layout[i].position.h) > position.y) {
            return false
        }
    }
    return true
}

export const moveToFreePlace = (layout, boxLayout, bubbleUp) => {
    var newBoxLayout = cloneBoxLayout(boxLayout)
    if (bubbleUp) {
        newBoxLayout.position.y = 0
    }
    while (!isFree(layout, newBoxLayout.position)) {
        newBoxLayout.position.y++
    }
    return newBoxLayout
}

export const bubbleUp = (layout) => {
    layout = sortLayout(layout)
    let newLayout = []
    while (layout.length) {
        let boxLayout = layout.shift()
        boxLayout.position.y--
        while (isFree(newLayout, boxLayout.position) && boxLayout.position.y >= 0) {
            boxLayout.position.y--
        }
        boxLayout.position.y++
        newLayout.push(boxLayout)
    }
    return newLayout
}

export const cloneBoxLayout = (boxLayout) => {
    var position = Object.assign({}, boxLayout.position)
    return Object.assign({}, boxLayout, { position })
}

export const cloneLayout = (layout) => {
    return layout.map((boxLayout) => {
        return cloneBoxLayout(boxLayout)
    })
}

export const positionToPixels = (position, gridSize, margin = 0, outerMargin = 0) => {
    return {
        x: (position.x * gridSize.w) + ((position.x) * margin) + outerMargin,
        y: (position.y * gridSize.h) + ((position.y) * margin) + outerMargin,
        w: (position.w * gridSize.w) + ((position.w - 1) * margin),
        h: (position.h * gridSize.h) + ((position.h - 1) * margin)
    }
}

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

export const sortLayout = (layout) => {
    return layout.sort((a, b) => {
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

// check if element matches a selector
// https://davidwalsh.name/element-matches-selector
export const matchesSelector = (el, selector) => {
    var p = Element.prototype
    var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
        return [].indexOf.call(document.querySelectorAll(s), this) !== -1
    }
    return f.call(el, selector)
}
