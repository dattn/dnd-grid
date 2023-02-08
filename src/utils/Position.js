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
