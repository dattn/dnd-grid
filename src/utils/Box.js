import { isFree } from './Position.js'

// immutable box position update
export function updatePosition (box, position) {
    return {
        ...box,
        position: {
            ...box.position,
            ...position
        }
    }
}

// moves the box to the upmost free position
export function bubbleUp (layout, box) {
    do {
        box = updatePosition(box, {
            y: box.position.y - 1
        })
    } while (
        box.position.y >= 0 &&
        isFree(layout, box.position, _box => _box.id !== box.id)
    )

    // we need to go one step back, because last position is not free
    return updatePosition(box, {
        y: box.position.y + 1
    })
}

// updates box position to a free place in a given layout
export function moveToFreePlace (layout, box, doBubbleUp) {
    if (doBubbleUp) {
        box = bubbleUp(layout, box)
    }
    while (!isFree(layout, box.position, _box => _box.id !== box.id)) {
        box = updatePosition(box, {
            y: box.position.y + 1
        })
    }
    return box
}

// create new box
export function create (id) {
    return {
        id,
        position: {
            x: 1,
            y: 1,
            w: 1,
            h: 1
        }
    }
}

// update box state
export function updateState (box, state) {
    return {
        ...box,
        ...state,
        id: box.id,
        position: box.position
    }
}
