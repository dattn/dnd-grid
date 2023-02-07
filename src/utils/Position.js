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
    const cellWidthWithSpacing = cellWidth + spacing
    const cellHeightWithSpacing = cellHeight + spacing
    return {
        x: position.x * cellWidthWithSpacing,
        y: position.y * cellHeightWithSpacing,
        w: (position.w * cellWidthWithSpacing) - spacing,
        h: (position.h * cellHeightWithSpacing) - spacing
    }
}

// get box position from pixels
export function fromPixels (pixels, cellWidth, cellHeight, spacing = 0) {
    const cellWidthWithSpacing = cellWidth + spacing
    const cellHeightWithSpacing = cellHeight + spacing
    return {
        x: Math.floor(pixels.x / cellWidthWithSpacing),
        y: Math.floor(pixels.y / cellHeightWithSpacing),
        w: Math.floor((pixels.w + spacing) / cellWidthWithSpacing),
        h: Math.floor((pixels.h + spacing) / cellHeightWithSpacing)
    }
}
