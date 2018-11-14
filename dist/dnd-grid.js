module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! exports provided: updateBoxLayout, updateBoxPosition, positionsAreColliding, isFree, bubbleUp, moveBoxToFreePlace, sortLayout, layoutBubbleUp, positionToPixels, getLayoutSize, matchesSelector, layoutHasCollisions, fixLayout */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateBoxLayout", function() { return updateBoxLayout; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateBoxPosition", function() { return updateBoxPosition; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "positionsAreColliding", function() { return positionsAreColliding; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFree", function() { return isFree; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bubbleUp", function() { return bubbleUp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveBoxToFreePlace", function() { return moveBoxToFreePlace; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sortLayout", function() { return sortLayout; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "layoutBubbleUp", function() { return layoutBubbleUp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "positionToPixels", function() { return positionToPixels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLayoutSize", function() { return getLayoutSize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "matchesSelector", function() { return matchesSelector; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "layoutHasCollisions", function() { return layoutHasCollisions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fixLayout", function() { return fixLayout; });
function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// reactive box layout update
var updateBoxLayout = function updateBoxLayout(boxLayout, data) {
    return Object.assign({}, boxLayout, data);
};

// reactive box position update
var updateBoxPosition = function updateBoxPosition(boxLayout, data) {
    return updateBoxLayout(boxLayout, {
        position: Object.assign({}, boxLayout.position, data)
    });
};

// check if 2 positions are colliding
var positionsAreColliding = function positionsAreColliding(positionA, positionB) {
    return positionA.x < positionB.x + positionB.w && positionA.x + positionA.w > positionB.x && positionA.y < positionB.y + positionB.h && positionA.y + positionA.h > positionB.y;
};

// check if position is free in layout
var isFree = function isFree(layout, position) {
    for (var i = 0; i < layout.length; i++) {
        if (positionsAreColliding(layout[i].position, position)) {
            return false;
        }
    }
    return true;
};

// moves the box to the upmost free position
var bubbleUp = function bubbleUp(layout, boxLayout) {
    do {
        boxLayout = updateBoxPosition(boxLayout, {
            y: boxLayout.position.y - 1
        });
    } while (isFree(layout, boxLayout.position) && boxLayout.position.y >= 0);
    return updateBoxPosition(boxLayout, {
        y: boxLayout.position.y + 1
    });
};

// updates box position to a free place in a given layout
var moveBoxToFreePlace = function moveBoxToFreePlace(layout, boxLayout, doBubbleUp) {
    if (doBubbleUp) {
        boxLayout = bubbleUp(layout, boxLayout);
    }
    while (!isFree(layout, boxLayout.position)) {
        boxLayout = updateBoxPosition(boxLayout, {
            y: boxLayout.position.y + 1
        });
    }
    return boxLayout;
};

// sort layout based on position and visibility
var sortLayout = function sortLayout(layout) {
    return [].concat(_toConsumableArray(layout)).sort(function (a, b) {
        if (a.hidden && !b.hidden) {
            return 1;
        }
        if (!a.hidden && b.hidden) {
            return -1;
        }
        if (a.pinned && !b.pinned) {
            return -1;
        }
        if (!a.pinned && b.pinned) {
            return 1;
        }
        if (a.position.y < b.position.y) {
            return -1;
        }
        if (a.position.y > b.position.y) {
            return 1;
        }
        if (a.position.x < b.position.x) {
            return -1;
        }
        if (a.position.x > b.position.x) {
            return 1;
        }
        return 0;
    });
};

// moves all boxes to the upmost free position
var layoutBubbleUp = function layoutBubbleUp(layout) {
    layout = sortLayout(layout);
    var newLayout = [];
    layout.forEach(function (boxLayout) {
        newLayout.push(bubbleUp(newLayout, boxLayout));
    });
    return newLayout;
};

// get box position in pixels
var positionToPixels = function positionToPixels(position, cellSize) {
    var margin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var outerMargin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    return {
        x: position.x * cellSize.w + position.x * margin + outerMargin,
        y: position.y * cellSize.h + position.y * margin + outerMargin,
        w: position.w * cellSize.w + (position.w - 1) * margin,
        h: position.h * cellSize.h + (position.h - 1) * margin
    };
};

// get layout bounding box
var getLayoutSize = function getLayoutSize(layout) {
    return {
        w: layout.reduce(function (width, boxLayout) {
            return boxLayout.hidden ? width : Math.max(width, boxLayout.position.x + boxLayout.position.w);
        }, 0),
        h: layout.reduce(function (height, boxLayout) {
            return boxLayout.hidden ? height : Math.max(height, boxLayout.position.y + boxLayout.position.h);
        }, 0)
    };
};

// check if element matches a selector
// https://davidwalsh.name/element-matches-selector
var matchesSelector = function matchesSelector(el, selector) {
    var p = Element.prototype;
    var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
        return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
    };
    return f.call(el, selector);
};

// check if layout has collisions
var layoutHasCollisions = function layoutHasCollisions(layout) {
    for (var i = 0; i < layout.length; i++) {
        for (var j = i + 1; j < layout.length; j++) {
            if (positionsAreColliding(layout[i].position, layout[j].position)) {
                return true;
            }
        }
    }
    return false;
};

// fix layout with collisions
var fixLayout = function fixLayout(layout, doBubbleUp) {
    layout = sortLayout(layout);
    var fixedLayout = [];
    layout.forEach(function (boxLayout) {
        fixedLayout.push(moveBoxToFreePlace(fixedLayout, boxLayout, doBubbleUp));
    });
    return fixedLayout;
};

/***/ }),
/* 1 */
/*!***************************!*\
  !*** ./src/Container.vue ***!
  \***************************/
/*! exports provided: default, List */
/*! exports used: List, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_babelrc_false_presets_Users_Jeffrey_repository_dnd_grid_node_modules_babel_preset_poi_index_js_jsx_vue_cacheDirectory_true_node_modules_vue_loader_lib_selector_type_script_index_0_Container_vue__ = __webpack_require__(/*! !babel-loader?{"babelrc":false,"presets":[["/Users/Jeffrey/repository/dnd-grid/node_modules/babel-preset-poi/index.js",{"jsx":"vue"}]],"cacheDirectory":true}!../node_modules/vue-loader/lib/selector?type=script&index=0!./Container.vue */ 3);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_babelrc_false_presets_Users_Jeffrey_repository_dnd_grid_node_modules_babel_preset_poi_index_js_jsx_vue_cacheDirectory_true_node_modules_vue_loader_lib_selector_type_script_index_0_Container_vue__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_39f2aa20_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Container_vue__ = __webpack_require__(/*! !../node_modules/vue-loader/lib/template-compiler/index?{"id":"data-v-39f2aa20","hasScoped":false,"buble":{"transforms":{}}}!../node_modules/vue-loader/lib/selector?type=template&index=0!./Container.vue */ 12);
function injectStyle (ssrContext) {
  __webpack_require__(/*! !../node_modules/extract-text-webpack-plugin/dist/loader.js?{"omit":1,"remove":true}!vue-style-loader!css-loader?{"autoprefixer":false,"sourceMap":false,"minimize":0}!../node_modules/vue-loader/lib/style-compiler/index?{"vue":true,"id":"data-v-39f2aa20","scoped":false,"hasInlineConfig":true}!../node_modules/vue-loader/lib/selector?type=styles&index=0!./Container.vue */ 9)
}
var normalizeComponent = __webpack_require__(/*! ../node_modules/vue-loader/lib/component-normalizer */ 2)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_babelrc_false_presets_Users_Jeffrey_repository_dnd_grid_node_modules_babel_preset_poi_index_js_jsx_vue_cacheDirectory_true_node_modules_vue_loader_lib_selector_type_script_index_0_Container_vue__["b" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_39f2aa20_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Container_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["b"] = (Component.exports);


/***/ }),
/* 2 */
/*!*************************************************************!*\
  !*** ./node_modules/vue-loader/lib/component-normalizer.js ***!
  \*************************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file.
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate

    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 3 */
/*!*************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib?{"babelrc":false,"presets":[["/Users/Jeffrey/repository/dnd-grid/node_modules/babel-preset-poi/index.js",{"jsx":"vue"}]],"cacheDirectory":true}!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./src/Container.vue ***!
  \*************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: List, default */
/*! exports used: List, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return List; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Box__ = __webpack_require__(/*! ./Box */ 4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(/*! ./utils */ 0);
function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




var List = new Set();

/* harmony default export */ __webpack_exports__["b"] = ({
    name: 'DndGridContainer',
    components: {
        Box: __WEBPACK_IMPORTED_MODULE_0__Box__["a" /* default */]
    },
    props: {
        layout: {
            type: Array,
            required: true
        },
        cellSize: {
            type: Object,
            default: function _default() {
                return {
                    w: 100,
                    h: 100
                };
            }
        },
        maxColumnCount: {
            type: Number,
            default: Infinity
        },
        maxRowCount: {
            type: Number,
            default: Infinity
        },
        margin: {
            type: Number,
            default: 5
        },
        outerMargin: {
            type: Number,
            default: 0
        },
        bubbleUp: {
            type: Boolean,
            default: false
        },
        autoAddLayoutForNewBox: {
            type: Boolean,
            required: false,
            default: true
        },
        defaultSize: {
            type: Object,
            required: false,
            default: function _default() {
                return {
                    w: 1,
                    h: 1
                };
            }
        },
        fixLayoutOnLoad: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    watch: {
        layout: function layout(newLayout) {
            if (this.fixLayoutOnLoad) {
                if (__WEBPACK_IMPORTED_MODULE_1__utils__["layoutHasCollisions"](newLayout)) {
                    this.updateLayout(__WEBPACK_IMPORTED_MODULE_1__utils__["fixLayout"](newLayout, this.bubbleUp));
                }
            }
        }
    },
    data: function data() {
        return {
            placeholder: {
                hidden: true,
                position: {
                    x: 0,
                    y: 0,
                    w: 1,
                    h: 1
                }
            },
            dragging: {
                boxLayout: null,
                offset: {
                    x: 0,
                    y: 0
                }
            },
            resizing: {
                boxLayout: null,
                offset: {
                    x: 0,
                    y: 0
                }
            },
            isMounted: false
        };
    },

    computed: {
        style: function style() {
            var layoutSize = __WEBPACK_IMPORTED_MODULE_1__utils__["getLayoutSize"](this.layout);
            return {
                minWidth: layoutSize.w * this.cellSize.w + (layoutSize.w - 1) * this.margin + 2 * this.outerMargin + 'px',
                minHeight: layoutSize.h * this.cellSize.h + (layoutSize.h - 1) * this.margin + 2 * this.outerMargin + 'px'
            };
        },
        pinnedLayout: function pinnedLayout() {
            return this.layout.filter(function (boxLayout) {
                return boxLayout.pinned;
            });
        },
        layoutMap: function layoutMap() {
            var map = new Map();
            this.layout.forEach(function (boxLayout) {
                map.set(boxLayout.id, boxLayout);
            });
            return map;
        }
    },
    methods: {
        getBoxLayoutById: function getBoxLayoutById(id) {
            if (id === '::placeholder::') {
                return this.placeholder;
            }
            return this.layoutMap.get(id);
        },
        getPixelPositionById: function getPixelPositionById(id) {
            if (this.dragging.boxLayout && this.dragging.boxLayout.id === id) {
                var pixels = __WEBPACK_IMPORTED_MODULE_1__utils__["positionToPixels"](this.dragging.boxLayout.position, this.cellSize, this.margin, this.outerMargin);
                pixels.x += this.dragging.offset.x;
                pixels.y += this.dragging.offset.y;
                return pixels;
            }

            if (this.resizing.boxLayout && this.resizing.boxLayout.id === id) {
                var _pixels = __WEBPACK_IMPORTED_MODULE_1__utils__["positionToPixels"](this.resizing.boxLayout.position, this.cellSize, this.margin, this.outerMargin);
                _pixels.w += this.resizing.offset.x;
                _pixels.h += this.resizing.offset.y;
                return _pixels;
            }

            var boxLayout = this.getBoxLayoutById(id);
            return __WEBPACK_IMPORTED_MODULE_1__utils__["positionToPixels"](boxLayout.position, this.cellSize, this.margin, this.outerMargin);
        },
        isBoxVisible: function isBoxVisible(id) {
            var boxLayout = this.getBoxLayoutById(id);
            return boxLayout && !boxLayout.hidden;
        },
        getPositionByPixel: function getPositionByPixel(x, y) {
            return {
                x: Math.round(x / (this.cellSize.w + this.margin)),
                y: Math.round(y / (this.cellSize.h + this.margin))
            };
        },
        updateLayout: function updateLayout(layout) {
            this.$emit('update:layout', layout);
        },
        registerBox: function registerBox(box) {
            this.enableResizing(box);
            this.enableDragging(box);
            if (this.isMounted && this.autoAddLayoutForNewBox) {
                this.createBoxLayout(box.$props.boxId);
            }
        },
        unregisterBox: function unregisterBox(box) {},
        enableDragging: function enableDragging(box) {
            var _this = this;

            var initialLayout;
            var isDragging = false;

            var validateTargetPosition = function validateTargetPosition(targetX, targetY) {
                if (targetX + _this.dragging.boxLayout.position.w > _this.maxColumnCount) {
                    targetX = _this.maxColumnCount - _this.dragging.boxLayout.position.w;
                } else {
                    if (targetX < 0) {
                        targetX = 0;
                    }
                }
                if (targetY + _this.dragging.boxLayout.position.h > _this.maxRowCount) {
                    targetY = _this.maxRowCount - _this.dragging.boxLayout.position.h;
                } else {
                    if (targetY < 0) {
                        targetY = 0;
                    }
                }
                return {
                    targetX: targetX,
                    targetY: targetY
                };
            };

            box.$on('dragStart', function (evt) {
                var boxLayout = _this.getBoxLayoutById(box.boxId);
                if (boxLayout.pinned) {
                    return;
                }
                isDragging = true;

                // find box
                _this.dragging.boxLayout = boxLayout;
                _this.placeholder = Object.assign({}, _this.dragging.boxLayout);

                // clone layout
                initialLayout = __WEBPACK_IMPORTED_MODULE_1__utils__["sortLayout"](_this.layout);

                _this.$emit('drag:start', initialLayout);
            });

            box.$on('dragUpdate', function (evt) {
                if (!isDragging) {
                    return;
                }
                _this.dragging.offset.x = evt.offset.x;
                _this.dragging.offset.y = evt.offset.y;

                var moveBy = _this.getPositionByPixel(evt.offset.x, evt.offset.y);
                if (!__WEBPACK_IMPORTED_MODULE_1__utils__["isFree"](_this.pinnedLayout, Object.assign({}, _this.dragging.boxLayout.position, {
                    x: _this.dragging.boxLayout.position.x + moveBy.x,
                    y: _this.dragging.boxLayout.position.y + moveBy.y
                }))) {
                    return;
                }

                var _validateTargetPositi = validateTargetPosition(_this.dragging.boxLayout.position.x + moveBy.x, _this.dragging.boxLayout.position.y + moveBy.y),
                    targetX = _validateTargetPositi.targetX,
                    targetY = _validateTargetPositi.targetY;

                // check if box has moved


                if (_this.placeholder.position.x === targetX && _this.placeholder.position.y === targetY) {
                    return;
                }
                _this.placeholder = __WEBPACK_IMPORTED_MODULE_1__utils__["updateBoxPosition"](_this.placeholder, {
                    x: targetX,
                    y: targetY
                });

                var newLayout = [_this.placeholder];
                initialLayout.forEach(function (boxLayout) {
                    if (boxLayout.id === _this.dragging.boxLayout.id) {
                        return;
                    }
                    newLayout.push(__WEBPACK_IMPORTED_MODULE_1__utils__["moveBoxToFreePlace"](newLayout, boxLayout, _this.bubbleUp));
                });

                if (_this.bubbleUp) {
                    newLayout = __WEBPACK_IMPORTED_MODULE_1__utils__["layoutBubbleUp"](newLayout);
                    _this.placeholder = newLayout.find(function (boxLayout) {
                        return boxLayout.id === _this.dragging.boxLayout.id;
                    });
                }
                _this.updateLayout(newLayout);

                _this.$emit('drag:update', newLayout);
            });

            box.$on('dragEnd', function (evt) {
                if (!isDragging) {
                    return;
                }
                var moveBy = _this.getPositionByPixel(evt.offset.x, evt.offset.y);
                if (__WEBPACK_IMPORTED_MODULE_1__utils__["isFree"](_this.pinnedLayout, Object.assign({}, _this.dragging.boxLayout.position, {
                    x: _this.dragging.boxLayout.position.x + moveBy.x,
                    y: _this.dragging.boxLayout.position.y + moveBy.y
                }))) {
                    var _validateTargetPositi2 = validateTargetPosition(_this.dragging.boxLayout.position.x + moveBy.x, _this.dragging.boxLayout.position.y + moveBy.y),
                        targetX = _validateTargetPositi2.targetX,
                        targetY = _validateTargetPositi2.targetY;

                    _this.placeholder = __WEBPACK_IMPORTED_MODULE_1__utils__["updateBoxPosition"](_this.placeholder, {
                        x: targetX,
                        y: targetY
                    });
                }

                _this.dragging.boxLayout = __WEBPACK_IMPORTED_MODULE_1__utils__["updateBoxPosition"](_this.dragging.boxLayout, {
                    x: _this.placeholder.position.x,
                    y: _this.placeholder.position.y
                });

                var newLayout = [_this.dragging.boxLayout];
                initialLayout.forEach(function (boxPosition) {
                    if (boxPosition.id === _this.dragging.boxLayout.id) {
                        return;
                    }
                    newLayout.push(__WEBPACK_IMPORTED_MODULE_1__utils__["moveBoxToFreePlace"](newLayout, boxPosition, _this.bubbleUp));
                });

                if (_this.bubbleUp) {
                    newLayout = __WEBPACK_IMPORTED_MODULE_1__utils__["layoutBubbleUp"](newLayout);
                }
                _this.updateLayout(newLayout);

                _this.dragging.boxLayout = null;
                _this.dragging.offset.x = 0;
                _this.dragging.offset.y = 0;

                _this.placeholder.hidden = true;
                isDragging = false;

                _this.$emit('drag:end', newLayout);
            });
        },
        enableResizing: function enableResizing(box) {
            var _this2 = this;

            var initialLayout;
            var isResizing = false;

            var validateTargetSize = function validateTargetSize(targetW, targetH) {
                if (_this2.resizing.boxLayout.position.x + targetW > _this2.maxColumnCount) {
                    targetW = _this2.maxColumnCount - _this2.resizing.boxLayout.position.x;
                } else {
                    if (targetW < 1) {
                        targetW = 1;
                    }
                }
                if (_this2.resizing.boxLayout.position.y + targetH > _this2.maxRowCount) {
                    targetH = _this2.maxRowCount - _this2.resizing.boxLayout.position.y;
                } else {
                    if (targetH < 1) {
                        targetH = 1;
                    }
                }
                return {
                    targetW: targetW,
                    targetH: targetH
                };
            };

            box.$on('resizeStart', function (evt) {
                var boxLayout = _this2.getBoxLayoutById(box.boxId);
                if (boxLayout.pinned) {
                    return;
                }
                isResizing = true;

                // find box
                _this2.resizing.boxLayout = boxLayout;
                _this2.placeholder = Object.assign({}, _this2.resizing.boxLayout);

                // clone layout
                initialLayout = __WEBPACK_IMPORTED_MODULE_1__utils__["sortLayout"](_this2.layout);

                _this2.$emit('resize:start', initialLayout);
            });

            box.$on('resizeUpdate', function (evt) {
                if (!isResizing) {
                    return;
                }
                _this2.resizing.offset.x = evt.offset.x;
                _this2.resizing.offset.y = evt.offset.y;

                var resizeBy = _this2.getPositionByPixel(evt.offset.x, evt.offset.y);
                if (!__WEBPACK_IMPORTED_MODULE_1__utils__["isFree"](_this2.pinnedLayout, Object.assign({}, _this2.resizing.boxLayout.position, {
                    w: _this2.resizing.boxLayout.position.w + resizeBy.x,
                    h: _this2.resizing.boxLayout.position.h + resizeBy.y
                }))) {
                    return;
                }

                var _validateTargetSize = validateTargetSize(_this2.resizing.boxLayout.position.w + resizeBy.x, _this2.resizing.boxLayout.position.h + resizeBy.y),
                    targetW = _validateTargetSize.targetW,
                    targetH = _validateTargetSize.targetH;

                // check if box size has changed


                if (_this2.placeholder.position.w === targetW && _this2.placeholder.position.h === targetH) {
                    return;
                }
                _this2.placeholder = __WEBPACK_IMPORTED_MODULE_1__utils__["updateBoxPosition"](_this2.placeholder, {
                    w: targetW,
                    h: targetH
                });

                var newLayout = [_this2.placeholder];
                initialLayout.forEach(function (boxLayout) {
                    if (boxLayout.id === _this2.resizing.boxLayout.id) {
                        return;
                    }
                    newLayout.push(__WEBPACK_IMPORTED_MODULE_1__utils__["moveBoxToFreePlace"](newLayout, boxLayout, _this2.bubbleUp));
                });

                if (_this2.bubbleUp) {
                    newLayout = __WEBPACK_IMPORTED_MODULE_1__utils__["layoutBubbleUp"](newLayout);
                    _this2.placeholder = newLayout.find(function (boxLayout) {
                        return boxLayout.id === _this2.resizing.boxLayout.id;
                    });
                }
                _this2.updateLayout(newLayout);

                _this2.$emit('resize:update', newLayout);
            });

            box.$on('resizeEnd', function (evt) {
                if (!isResizing) {
                    return;
                }
                var resizeBy = _this2.getPositionByPixel(evt.offset.x, evt.offset.y);
                if (__WEBPACK_IMPORTED_MODULE_1__utils__["isFree"](_this2.pinnedLayout, Object.assign({}, _this2.resizing.boxLayout.position, {
                    w: _this2.resizing.boxLayout.position.w + resizeBy.x,
                    h: _this2.resizing.boxLayout.position.h + resizeBy.y
                }))) {
                    var _validateTargetSize2 = validateTargetSize(_this2.resizing.boxLayout.position.w + resizeBy.x, _this2.resizing.boxLayout.position.h + resizeBy.y),
                        targetW = _validateTargetSize2.targetW,
                        targetH = _validateTargetSize2.targetH;

                    _this2.placeholder = __WEBPACK_IMPORTED_MODULE_1__utils__["updateBoxPosition"](_this2.placeholder, {
                        w: targetW,
                        h: targetH
                    });
                }

                _this2.resizing.boxLayout = __WEBPACK_IMPORTED_MODULE_1__utils__["updateBoxPosition"](_this2.resizing.boxLayout, {
                    w: _this2.placeholder.position.w,
                    h: _this2.placeholder.position.h
                });

                var newLayout = [_this2.resizing.boxLayout];
                initialLayout.forEach(function (boxPosition) {
                    if (boxPosition.id === _this2.resizing.boxLayout.id) {
                        return;
                    }
                    newLayout.push(__WEBPACK_IMPORTED_MODULE_1__utils__["moveBoxToFreePlace"](newLayout, boxPosition, _this2.bubbleUp));
                });

                if (_this2.bubbleUp) {
                    newLayout = __WEBPACK_IMPORTED_MODULE_1__utils__["layoutBubbleUp"](newLayout);
                }
                _this2.updateLayout(newLayout);

                _this2.resizing.boxLayout = null;
                _this2.resizing.offset.x = 0;
                _this2.resizing.offset.y = 0;

                _this2.placeholder.hidden = true;

                _this2.$emit('resize:end', newLayout);
            });
        },
        createBoxLayout: function createBoxLayout() {
            var _this3 = this;

            for (var _len = arguments.length, boxIds = Array(_len), _key = 0; _key < _len; _key++) {
                boxIds[_key] = arguments[_key];
            }

            boxIds = boxIds.filter(function (boxId) {
                return !_this3.getBoxLayoutById(boxId);
            });

            if (boxIds.length) {
                var newLayout = [].concat(_toConsumableArray(this.layout));
                boxIds.forEach(function (boxId) {
                    newLayout.push(__WEBPACK_IMPORTED_MODULE_1__utils__["moveBoxToFreePlace"](newLayout, {
                        id: boxId,
                        hidden: false,
                        position: Object.assign({
                            x: 0,
                            y: 0
                        }, _this3.defaultSize)
                    }, _this3.bubbleUp));
                });
                this.updateLayout(newLayout);
            }
        }
    },
    created: function created() {
        List.add(this);
    },
    mounted: function mounted() {
        this.isMounted = true;
        var boxIds = this.$children.map(function (box) {
            return box.$props.boxId;
        });
        this.createBoxLayout.apply(this, _toConsumableArray(boxIds));
    },
    beforeDestroy: function beforeDestroy() {
        List.delete(this);
    }
});

/***/ }),
/* 4 */
/*!*********************!*\
  !*** ./src/Box.vue ***!
  \*********************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_babelrc_false_presets_Users_Jeffrey_repository_dnd_grid_node_modules_babel_preset_poi_index_js_jsx_vue_cacheDirectory_true_node_modules_vue_loader_lib_selector_type_script_index_0_Box_vue__ = __webpack_require__(/*! !babel-loader?{"babelrc":false,"presets":[["/Users/Jeffrey/repository/dnd-grid/node_modules/babel-preset-poi/index.js",{"jsx":"vue"}]],"cacheDirectory":true}!../node_modules/vue-loader/lib/selector?type=script&index=0!./Box.vue */ 5);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_99ca528c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Box_vue__ = __webpack_require__(/*! !../node_modules/vue-loader/lib/template-compiler/index?{"id":"data-v-99ca528c","hasScoped":false,"buble":{"transforms":{}}}!../node_modules/vue-loader/lib/selector?type=template&index=0!./Box.vue */ 11);
function injectStyle (ssrContext) {
  __webpack_require__(/*! !../node_modules/extract-text-webpack-plugin/dist/loader.js?{"omit":1,"remove":true}!vue-style-loader!css-loader?{"autoprefixer":false,"sourceMap":false,"minimize":0}!../node_modules/vue-loader/lib/style-compiler/index?{"vue":true,"id":"data-v-99ca528c","scoped":false,"hasInlineConfig":true}!../node_modules/vue-loader/lib/selector?type=styles&index=0!./Box.vue */ 10)
}
var normalizeComponent = __webpack_require__(/*! ../node_modules/vue-loader/lib/component-normalizer */ 2)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_babelrc_false_presets_Users_Jeffrey_repository_dnd_grid_node_modules_babel_preset_poi_index_js_jsx_vue_cacheDirectory_true_node_modules_vue_loader_lib_selector_type_script_index_0_Box_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_99ca528c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Box_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 5 */
/*!*******************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib?{"babelrc":false,"presets":[["/Users/Jeffrey/repository/dnd-grid/node_modules/babel-preset-poi/index.js",{"jsx":"vue"}]],"cacheDirectory":true}!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./src/Box.vue ***!
  \*******************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Container__ = __webpack_require__(/*! ./Container */ 1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(/*! ./utils */ 0);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["a"] = ({
    name: 'DndGridBox',
    props: {
        boxId: {
            required: true
        },
        dragSelector: {
            type: String,
            default: '*'
        },
        resizeVisible: {
            type: Boolean,
            default: false
        }
    },
    data: function data() {
        return {
            container: null,
            dragging: false,
            resizing: false
        };
    },

    computed: {
        style: function style() {
            if (this.container && this.container.isBoxVisible(this.boxId)) {
                var pixelPosition = this.container.getPixelPositionById(this.boxId);
                return {
                    display: 'block',
                    width: pixelPosition.w + 'px',
                    height: pixelPosition.h + 'px',
                    transform: 'translate(' + pixelPosition.x + 'px, ' + pixelPosition.y + 'px)'
                };
            }

            return {
                display: 'none'
            };
        },
        classes: function classes() {
            return {
                'dnd-grid-box': true,
                'dragging': this.dragging,
                'resizing': this.resizing,
                'resize.visible': this.resizeVisible
            };
        }
    },
    methods: {
        findContainer: function findContainer() {
            var current = this;
            while (current.$parent) {
                current = current.$parent;
                if (__WEBPACK_IMPORTED_MODULE_0__Container__["a" /* List */].has(current)) {
                    return current;
                }
            }
            return null;
        }
    },
    mounted: function mounted() {
        var _this = this;

        this.container = this.findContainer();
        if (!this.container) {
            throw new Error('Can not find container');
        }

        // register component on parent
        this.container.registerBox(this);

        // moving
        this.$dragHandle = this.$el || this.$refs.dragHandle;

        var startEvent = function startEvent(evt) {
            if (!__WEBPACK_IMPORTED_MODULE_1__utils__["matchesSelector"](evt.target, _this.dragSelector)) {
                return;
            }

            evt.preventDefault();
            _this.dragging = true;
            _this.$emit('dragStart');
            var positionX = evt.clientX || evt.touches[0].pageX;
            var positionY = evt.clientY || evt.touches[0].pageY;

            var handleEndDrag = function handleEndDrag(evt) {
                window.removeEventListener('mouseup', handleEndDrag, true);
                window.removeEventListener('touchend', handleEndDrag, true);
                window.removeEventListener('mousemove', handleMoveDrag, true);
                window.removeEventListener('touchmove', handleMoveDrag, true);

                _this.dragging = false;

                var offset = {
                    x: (evt.clientX || evt.changedTouches[0].pageX) - positionX,
                    y: (evt.clientY || evt.changedTouches[0].pageY) - positionY
                };
                _this.$emit('dragEnd', { offset: offset });
            };

            var handleMoveDrag = function handleMoveDrag(evt) {
                var offset = {
                    x: (evt.clientX || evt.touches[0].pageX) - positionX,
                    y: (evt.clientY || evt.touches[0].pageY) - positionY
                };
                _this.$emit('dragUpdate', { offset: offset });
            };

            window.addEventListener('mouseup', handleEndDrag, true);
            window.addEventListener('touchend', handleEndDrag, true);
            window.addEventListener('mousemove', handleMoveDrag, true);
            window.addEventListener('touchmove', handleMoveDrag, true);
        };

        this.$dragHandle.addEventListener('mousedown', startEvent);
        this.$dragHandle.addEventListener('touchstart', startEvent);

        // resizing
        this.$resizeHandle = this.$refs.resizeHandle;
        if (this.$resizeHandle) {
            var resizeStart = function resizeStart(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                _this.resizing = true;
                _this.$emit('resizeStart');
                var positionX = evt.clientX || evt.touches[0].pageX;
                var positionY = evt.clientY || evt.touches[0].pageY;

                var handleEndResize = function handleEndResize(evt) {
                    window.removeEventListener('mouseup', handleEndResize, true);
                    window.removeEventListener('touchend', handleEndResize, true);
                    window.removeEventListener('mousemove', handleMoveResize, true);
                    window.removeEventListener('touchmove', handleMoveResize, true);

                    _this.resizing = false;

                    var offset = {
                        x: (evt.clientX || evt.changedTouches[0].pageX) - positionX,
                        y: (evt.clientY || evt.changedTouches[0].pageY) - positionY
                    };
                    _this.$emit('resizeEnd', { offset: offset });
                };

                var handleMoveResize = function handleMoveResize(evt) {
                    var offset = {
                        x: (evt.clientX || evt.touches[0].pageX) - positionX,
                        y: (evt.clientY || evt.touches[0].pageY) - positionY
                    };
                    _this.$emit('resizeUpdate', { offset: offset });
                };

                window.addEventListener('mouseup', handleEndResize, true);
                window.addEventListener('touchend', handleEndResize, true);
                window.addEventListener('mousemove', handleMoveResize, true);
                window.addEventListener('touchmove', handleMoveResize, true);
            };

            this.$resizeHandle.addEventListener('mousedown', resizeStart);
            this.$resizeHandle.addEventListener('touchstart', resizeStart);
        }
    },
    beforeDestroy: function beforeDestroy() {
        // register component on parent
        if (this.container) {
            this.container.unregisterBox(this);
        }
    }
});

/***/ }),
/* 6 */
/*!****************************!*\
  !*** multi ./src/index.js ***!
  \****************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/Jeffrey/repository/dnd-grid/src/index.js */7);


/***/ }),
/* 7 */
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var components = __webpack_require__(/*! ./components */ 8);
module.exports = components;

var initComponent = function initComponent(component) {
    component.install = function (Vue) {
        return Vue.component(component.name, component);
    };

    // Install by default if using the script tag
    if (typeof window !== 'undefined' && window.Vue) {
        window.Vue.use(component);
    }
};

for (var key in components) {
    initComponent(components[key]);
}

/***/ }),
/* 8 */
/*!***************************!*\
  !*** ./src/components.js ***!
  \***************************/
/*! exports provided: Container, Box, utils */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Container__ = __webpack_require__(/*! ./Container */ 1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Box__ = __webpack_require__(/*! ./Box */ 4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(/*! ./utils */ 0);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Container", function() { return __WEBPACK_IMPORTED_MODULE_0__Container__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Box", function() { return __WEBPACK_IMPORTED_MODULE_1__Box__["a"]; });
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "utils", function() { return __WEBPACK_IMPORTED_MODULE_2__utils__; });






/***/ }),
/* 9 */
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/extract-text-webpack-plugin/dist/loader.js?{"omit":1,"remove":true}!./node_modules/vue-style-loader!./node_modules/css-loader?{"autoprefixer":false,"sourceMap":false,"minimize":0}!./node_modules/vue-loader/lib/style-compiler?{"vue":true,"id":"data-v-39f2aa20","scoped":false,"hasInlineConfig":true}!./node_modules/vue-loader/lib/selector.js?type=styles&index=0!./src/Container.vue ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 10 */
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/extract-text-webpack-plugin/dist/loader.js?{"omit":1,"remove":true}!./node_modules/vue-style-loader!./node_modules/css-loader?{"autoprefixer":false,"sourceMap":false,"minimize":0}!./node_modules/vue-loader/lib/style-compiler?{"vue":true,"id":"data-v-99ca528c","scoped":false,"hasInlineConfig":true}!./node_modules/vue-loader/lib/selector.js?type=styles&index=0!./src/Box.vue ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 11 */
/*!**********************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-99ca528c","hasScoped":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./src/Box.vue ***!
  \**********************************************************************************************************************************************************************************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"dragHandle",class:_vm.classes,style:(_vm.style)},[_vm._t("default"),_vm._v(" "),_c('div',{ref:"resizeHandle",staticClass:"resize-handle"})],2)}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),
/* 12 */
/*!****************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-39f2aa20","hasScoped":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./src/Container.vue ***!
  \****************************************************************************************************************************************************************************************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"dnd-grid-container",style:(_vm.style)},[_vm._t("default"),_vm._v(" "),_c('box',{staticClass:"placeholder",attrs:{"boxId":"::placeholder::"}})],2)}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ })
/******/ ]);