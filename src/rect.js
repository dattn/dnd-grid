export default class Rect {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.x1 = x
        this.x2 = x + width
        this.y1 = y
        this.y2 = y + height
    }

    intersect(rect) {
        return this.x1 < rect.x2 &&
                this.x2 > rect.x1 &&
                this.y1 < rect.y2 &&
                this.y2 > rect.y1
    }

    collide(rect) {
        return this.intersect(rect)
    }
}
