export const isFree = (layout, x, y, w = 1, h = 1) => {
    for (let i = 0; i < layout.length; i++) {
        if (layout[i].x < (x + w)
            && (layout[i].x + layout[i].w) > x
            && layout[i].y < (y + h)
            && (layout[i].y + layout[i].h) > y) {
            return false;
        }
    }
    return true;
}
