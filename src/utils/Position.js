// check if 2 positions are overlapping
export function isOverlapping (positionA, positionB) {
    return positionA.x < (positionB.x + positionB.w) &&
        (positionA.x + positionA.w) > positionB.x &&
        positionA.y < (positionB.y + positionB.h) &&
        (positionA.y + positionA.h) > positionB.y
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

// get box position in pixels
export function toPixels (position, cellWidth, cellHeight, spacing = 0) {
    return {
        x: (position.x * cellWidth) + ((position.x) * spacing),
        y: (position.y * cellHeight) + ((position.y) * spacing),
        w: (position.w * cellWidth) + ((position.w - 1) * spacing),
        h: (position.h * cellHeight) + ((position.h - 1) * spacing)
    }
}
