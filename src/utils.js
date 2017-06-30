export const isFree = (layout, boxPosition) => {
    for (let i = 0; i < layout.length; i++) {
        if (layout[i].x < (boxPosition.x + boxPosition.w) &&
            (layout[i].x + layout[i].w) > boxPosition.x &&
            layout[i].y < (boxPosition.y + boxPosition.h) &&
            (layout[i].y + layout[i].h) > boxPosition.y) {
            return false;
        }
    }
    return true;
};

export const moveToFreePlace = (layout, boxPosition) => {
    var newBoxPosition = Object.assign({}, boxPosition);
    while (!isFree(layout, newBoxPosition)) {
        newBoxPosition.y++;
    }
    return newBoxPosition;
};

export const cloneLayout = (layout) => {
    return layout.map((boxPosition) => {
        return Object.assign({}, boxPosition);
    });
};

export const getLayoutSize = (layout) => {
    return {
        w: layout.reduce((acc, val) => {
            return Math.max(acc, val.x + val.w);
        }, 0),
        h: layout.reduce((acc, val) => {
            return Math.max(acc, val.y + val.h);
        }, 0)
    };
};
