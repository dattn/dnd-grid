export const isFree = (layout, position) => {
    for (let i = 0; i < layout.length; i++) {
        if (layout[i].x < (position.x + position.w) &&
            (layout[i].x + layout[i].w) > position.x &&
            layout[i].y < (position.y + position.h) &&
            (layout[i].y + layout[i].h) > position.y) {
            return false;
        }
    }
    return true;
};

export const moveToFreePlace = (layout, position) => {
    var newPosition = Object.assign({}, position);
    while (!isFree(layout, newPosition)) {
        newPosition.y++;
    }
    return newPosition;
};

export const cloneLayout = (layout) => {
    return layout.map((position) => {
        return Object.assign({}, position);
    });
};

export const positionToPixels = (position, gridSize, margin = 0) => {
    return {
        x: (position.x * gridSize.w) + ((position.x + 1) * margin),
        y: (position.y * gridSize.h) + ((position.y + 1) * margin),
        w: (position.w * gridSize.w) + ((position.w - 1) * margin),
        h: (position.h * gridSize.h) + ((position.h - 1) * margin)
    };
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
