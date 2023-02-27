/*
Layout json
[
    { // each box has his own object in the layout array
        id: 1, // box identifier (can be of any type)
        hidden: false, // is box hidden ?
        pinned: false, // should box stay fixed on its position
        isResizable: true, // box can be resized
        isDraggable: true, // box can be dragged
        position: { // box position in the layout grid
            x: 1, // horizontal position starting with 1
            y: 1, // vertical position starting with 1
            w: 5, // box width
            h: 2  // box height
        }
    },
    ...
]
*/

// sort layout based on position and visibility
export function sort (layout) {
    return [...layout].sort((a, b) => {
        if (a.hidden && !b.hidden) {
            return 1
        }
        if (!a.hidden && b.hidden) {
            return -1
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

// check if position is free in layout
export function isFree (layout, position, filter = () => true) {
    for (let i = 0; i < layout.length; i++) {
        if (!filter(layout[i])) continue
        if (isOverlapping(layout[i].position, position)) {
            return false
        }
    }
    return true
}

// get layout size based on boxes
export function getSize (layout) {
    let w = 0
    let h = 0
    for (let i = 0; i < layout.length; i++) {
        const box = layout[i]
        if (box.hidden) continue
        w = Math.max(w, box.position.x + box.position.w)
        h = Math.max(h, box.position.y + box.position.h)
    }
    return { w, h }
}

// updates box position to a free place in a given layout
export function moveToFreePlace (layout, box, layoutOptions) {
    if (box.pinned) {
        return box
    }
    const newPosition = { ...box.position }
    const initialY = newPosition.y

    if (layoutOptions?.bubbleUp && newPosition.y > 0) {
        if (layoutOptions?.bubbleUp === 'jump-over') {
            newPosition.y = 0
        }

        do {
            newPosition.y--
        } while (
            newPosition.y >= 0 &&
            isFree(layout, newPosition, _box => _box.id !== box.id)
        )
        newPosition.y++
    }

    while (!isFree(layout, newPosition, _box => _box.id !== box.id)) {
        newPosition.y++
    }

    if (newPosition.y === initialY) {
        return box
    }

    return updateBoxData(box, { position: newPosition })
}

// immutable box data merge
export function updateBoxData (box, data = {}) {
    // eslint-disable-next-line no-unused-vars
    const { id, position, ...layoutOptions } = data
    return {
        ...box,
        ...layoutOptions,
        position: {
            ...box.position,
            ...position
        }
    }
}

// fix layout based on layoutOptions
export function fix (layout, layoutOptions) {
    let newLayout = sort(layout)
    if (layoutOptions?.bubbleUp) {
        newLayout.forEach((box, index) => {
            newLayout[index] = moveToFreePlace(newLayout, box, layoutOptions)
        })
        newLayout = sort(newLayout)
    }
    return newLayout
}

// get box by id
export function getBox (layout, id) {
    return _getBox(layout, id).box
}

// create box
export function createBox (layout, id, data, layoutOptions) {
    let box = { id, position: { x: 0, y: 0, w: 1, h: 1 } }
    if (data) {
        box = updateBoxData(box, data)
    }
    return moveToFreePlace(layout, box, layoutOptions)
}

function placeBox (layout, box, layoutOptions) {
    let newLayout = layout.filter(_box => _box.id !== box.id && _box.pinned)
    box = moveToFreePlace(newLayout, box)
    newLayout.push(box)

    sort(layout).forEach(_box => {
        if (_box.id === box.id || _box.pinned) return
        newLayout.push(moveToFreePlace(newLayout, _box))
    })

    return fix(newLayout, layoutOptions)
}

// add box
export function addBox (layout, box, layoutOptions) {
    const { index, box: _box } = _getBox(layout, box.id)
    if (box === _box || index > -1) {
        return layout
    }

    return placeBox(layout, box, layoutOptions)
}

// update box
export function updateBox (layout, id, data, layoutOptions) {
    const { box } = _getBox(layout, id)
    if (!box) {
        return layout
    }

    return placeBox(layout, updateBoxData(box, data), layoutOptions)
}

// remove box
export function removeBox (layout, id, layoutOptions) {
    const index = _getBox(layout, id).index

    if (index > -1) {
        const newLayout = [...layout]
        newLayout.splice(index, 1)
        return fix(newLayout, layoutOptions)
    }

    return layout
}

// check if 2 positions are overlapping
export function isOverlapping (positionA, positionB) {
    return positionA.x < (positionB.x + positionB.w) &&
        (positionA.x + positionA.w) > positionB.x &&
        positionA.y < (positionB.y + positionB.h) &&
        (positionA.y + positionA.h) > positionB.y
}

// get box position in pixels
export function toPixels (position, cellWidth, cellHeight, spacing = 0) {
    const pixels = {}
    for (let key in position || {}) {
        switch (key) {
            case 'x':
                pixels[key] = position.x * (cellWidth + spacing)
                break
            case 'y':
                pixels[key] = position.y * (cellHeight + spacing)
                break
            case 'w':
                pixels[key] = (position.w * (cellWidth + spacing)) - spacing
                break
            case 'h':
                pixels[key] = (position.h * (cellHeight + spacing)) - spacing
                break
        }
    }
    return pixels
}

// get box position from pixels
export function fromPixels (pixels, cellWidth, cellHeight, spacing = 0) {
    const position = {}
    for (let key in pixels || {}) {
        switch (key) {
            case 'x':
                position[key] = Math.floor(pixels.x / (cellWidth + spacing))
                break
            case 'y':
                position[key] = Math.floor(pixels.y / (cellHeight + spacing))
                break
            case 'w':
                position[key] = Math.floor((pixels.w + spacing) / (cellWidth + spacing))
                break
            case 'h':
                position[key] = Math.floor((pixels.h + spacing) / (cellHeight + spacing))
                break
        }
    }
    return position
}

// get box helper. return box and the index
function _getBox (layout, id) {
    const index = layout.findIndex(box => box.id === id)
    return {
        index,
        box: index > -1 ? layout[index] : undefined
    }
}
