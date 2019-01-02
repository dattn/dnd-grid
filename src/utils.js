
// check if element matches a selector
// https://davidwalsh.name/element-matches-selector
export const matchesSelector = (el, selector) => {
    var p = Element.prototype
    var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
        return [].indexOf.call(document.querySelectorAll(s), this) !== -1
    }
    return f.call(el, selector)
}
