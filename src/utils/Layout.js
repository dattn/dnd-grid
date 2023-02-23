import { bubbleUp as bubbleUpBox, moveToFreePlace } from './Box.js'
import { isOverlapping } from './Position.js'

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

// sort layout based on box positions
export function sort (layout) {
    return [...layout].sort((a, b) => {
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
export function bubbleUp (layout) {
    layout = sort(layout)
    const newLayout = []
    layout.forEach(box => {
        newLayout.push(bubbleUpBox(newLayout, box))
    })
    return newLayout
}

// get layout bounding box
export function getSize (layout) {
    let w = 0
    let h = 0
    for (let i = 0; i < layout.length; i++) {
        if (layout[i].hidden) continue
        w = Math.max(w, layout[i].position.x + layout[i].position.w)
        h = Math.max(h, layout[i].position.y + layout[i].position.h)
    }
    return { w, h }
}

// check if layout has overlaps
export function hasOverlaps (layout) {
    for (let i = 0; i < layout.length; i++) {
        for (let j = i + 1; j < layout.length; j++) {
            if (isOverlapping(layout[i].position, layout[j].position)) {
                return true
            }
        }
    }
    return false
}

// fix layout with overlaps
export function fix (layout, doBubbleUp) {
    layout = sort(layout)
    let fixedLayout = []
    layout.forEach(box => {
        fixedLayout.push(moveToFreePlace(fixedLayout, box, doBubbleUp))
    })
    return fixedLayout
}

// replace or add box in layout
export function addOrReplaceBox (layout, box) {
    const index = layout.findIndex(_box => _box.id === box.id)

    const newLayout = [...layout]
    if (index > -1) {
        newLayout.splice(index, 1, box)
    } else {
        newLayout.push(box)
    }

    return newLayout
}

// find box by Id
export function getBox (layout, id) {
    return layout.find(box => box.id === id)
}
