export const isFree = (layout, position) => {
    for (let i = 0; i < layout.length; i++) {
        if (layout[i].position.x < (position.x + position.w) &&
            (layout[i].position.x + layout[i].position.w) > position.x &&
            layout[i].position.y < (position.y + position.h) &&
            (layout[i].position.y + layout[i].position.h) > position.y) {
            return false;
        }
    }
    return true;
};

export const moveToFreePlace = (layout, boxLayout) => {
    var newBoxLayout = cloneBoxLayout(boxLayout);
    while (!isFree(layout, newBoxLayout.position)) {
        newBoxLayout.position.y++;
    }
    return newBoxLayout;
};

export const cloneBoxLayout = (boxLayout) => {
    var position = Object.assign({}, boxLayout.position);
    return Object.assign({}, boxLayout, { position });
};

export const cloneLayout = (layout) => {
    return layout.map((boxLayout) => {
        return cloneBoxLayout(boxLayout);
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
            return Math.max(acc, val.position.x + val.position.w);
        }, 0),
        h: layout.reduce((acc, val) => {
            return Math.max(acc, val.position.y + val.position.h);
        }, 0)
    };
};

// check if element matches a selector
// https://davidwalsh.name/element-matches-selector
export const matchesSelector = (el, selector) => {
	var p = Element.prototype;
	var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
		return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
	};
	return f.call(el, selector);
};
