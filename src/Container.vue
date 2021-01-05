<template>
    <div
        class="dnd-grid-container"
        :style="style"
    >
        <slot></slot>
        <box
            class="placeholder"
            :style="computePlaceholderStyle"
            boxId="::placeholder::"
        ></box>
    </div>
</template>

<style>
    .dnd-grid-container {
        position: relative;
        transition: min-width ease-out 0.1s, min-height ease-out 0.1s;
    }

    .dnd-grid-container .dnd-grid-box.placeholder {
        transition: none !important;
    }
</style>

<script>
    import Box from './Box'
    import * as utils from './utils'

    export const List = new Set()

    export default {
        name: 'DndGridContainer',
        components: {
            Box
        },
        props: {
            layout: {
                type: Array,
                required: true
            },
            cellSize: {
                type: Object,
                default () {
                    return {
                        w: 100,
                        h: 100
                    }
                }
            },
            dynamicResize: {
                type: Boolean,
                default: true
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
                default () {
                    return {
                        w: 1,
                        h: 1
                    }
                }
            },
            fixLayoutOnLoad: {
                type: Boolean,
                required: false,
                default: true
            },
            gridStyle: {
                type: Object,
                required: false,
                default () { 
                    return {
                        backgroundColor: "rgb(47, 122, 202)",
                        color: "white",
                        thickness: "2px",
                        position: "-4px -4px, -4px -4px",
                        innerGrid: {
                            cols: 5,
                            rows: 5,
                            color: "#d0d0d0",
                            position: "-2px -2px, -2px -2px",
                            thickness: "1px"
                        }
                    }
                }
            },
            placeholderStyle: {
                type: Object,
                required: false,
                default () {
                    return {
                        border: '1px dashed white',
                        background: 'none',
                        zIndex: '0'
                    }
                }
            },
            nogrid: {
                type: Boolean,
                required: false,
                default: false
            }
        },
        watch: {
            layout (newLayout) {
                if (this.fixLayoutOnLoad) {
                    if (utils.layoutHasCollisions(newLayout)) {
                        this.updateLayout(utils.fixLayout(newLayout, this.bubbleUp))
                    }
                }
            }
        },
        data () {
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
            }
        },
        computed: {
            style () {
                var layoutSize = utils.getLayoutSize(this.layout)

                // Style should match the layout size if `dynamicResize` is false
                // This implies it is static and the cells should be apparent to the user
                if(!this.dynamicResize) {
                    layoutSize.w = this.maxColumnCount;
                    layoutSize.h = this.maxRowCount;
                }

                // Calculate the width and height css
                var style = {
                    minWidth: (
                        (layoutSize.w * this.cellSize.w) +
                        ((layoutSize.w - 1) * this.margin) +
                        (2 * this.outerMargin)
                    ) + 'px',
                    minHeight: (
                        (layoutSize.h * this.cellSize.h) +
                        ((layoutSize.h - 1) * this.margin) +
                        (2 * this.outerMargin)
                    ) + 'px'
                }

                // If `gridStyle` is non-null, apply rules
                if(this.gridStyle && !this.nogrid) {
                    let csize = { w: this.cellSize.w + this.margin, h: this.cellSize.h + this.margin }
                    let gsize = { w: Math.floor(csize.w/this.gridStyle.innerGrid.cols), h: Math.floor(csize.h/this.gridStyle.innerGrid.rows) }
                    let bThickness = this.gridStyle.thickness
                    let gThickness = this.gridStyle.innerGrid.thickness
                    let bgColor = this.gridStyle.backgroundColor
                    let ccolor = this.gridStyle.color
                    let gcolor = this.gridStyle.innerGrid.color

                    style = { 
                        ...style,
                        backgroundColor: `${bgColor}`,
                        backgroundSize: `${csize.w}px ${csize.h}px, ${csize.w}px ${csize.h}px`,
                        backgroundPosition: `${this.gridStyle.position}`,
                        backgroundImage: `-webkit-linear-gradient(${ccolor} ${bThickness}, transparent ${bThickness}),
                            -webkit-linear-gradient(0, ${ccolor} ${bThickness}, transparent ${bThickness}),
                            -webkit-linear-gradient(${gcolor} ${gThickness}, transparent ${gThickness}),
                            -webkit-linear-gradient(0, ${gcolor} ${gThickness}, transparent ${gThickness}),
                            -moz-linear-gradient(${ccolor} ${bThickness}, transparent ${bThickness}),
                            -moz-linear-gradient(0, ${ccolor} ${bThickness}, transparent ${bThickness}),
                            -moz-linear-gradient(${gcolor} ${gThickness}, transparent ${gThickness}),
                            -moz-linear-gradient(0, ${gcolor} ${gThickness}, transparent ${gThickness}),
                            linear-gradient(${ccolor} ${bThickness}, transparent ${bThickness}),
                            linear-gradient(0, ${ccolor} ${bThickness}, transparent ${bThickness}),
                            linear-gradient(${gcolor} ${gThickness}, transparent ${gThickness}),
                            linear-gradient(0, ${gcolor} ${gThickness}, transparent ${gThickness})`
                    }

                    if(gsize.w > 0 && gsize.h > 0) {
                        style.backgroundSize = `${style.backgroundSize}, ${gsize.w}px ${gsize.h}px, ${gsize.w}px ${gsize.h}px`
                        style.backgroundPosition = `${style.backgroundPosition}, ${this.gridStyle.innerGrid.position}`
                    }
                }

                // update properties object
                style = { ...style, maxWidth: style.minWidth, maxHeight: style.minHeight }

                // return the object to be used by Vue
                return style
            },
            computePlaceholderStyle() {
                return this.placeholderStyle;
            },
            pinnedLayout () {
                return this.layout.filter((boxLayout) => {
                    return boxLayout.pinned
                })
            },
            layoutMap () {
                let map = new Map()
                this.layout.forEach(boxLayout => {
                    map.set(boxLayout.id, boxLayout)
                })
                return map
            }
        },
        methods: {
            getBoxLayoutById (id) {
                if (id === '::placeholder::') {
                    return this.placeholder
                }
                return this.layoutMap.get(id)
            },
            getPixelPositionById (id) {
                if (this.dragging.boxLayout && this.dragging.boxLayout.id === id) {
                    let pixels = utils.positionToPixels(this.dragging.boxLayout.position, this.cellSize, this.margin, this.outerMargin)
                    pixels.x += this.dragging.offset.x
                    pixels.y += this.dragging.offset.y
                    return pixels
                }

                if (this.resizing.boxLayout && this.resizing.boxLayout.id === id) {
                    let pixels = utils.positionToPixels(this.resizing.boxLayout.position, this.cellSize, this.margin, this.outerMargin)
                    pixels.w += this.resizing.offset.x
                    pixels.h += this.resizing.offset.y
                    return pixels
                }

                var boxLayout = this.getBoxLayoutById(id)
                return utils.positionToPixels(boxLayout.position, this.cellSize, this.margin, this.outerMargin)
            },
            isBoxVisible (id) {
                var boxLayout = this.getBoxLayoutById(id)
                return boxLayout && !boxLayout.hidden
            },
            getPositionByPixel (x, y) {
                return {
                    x: Math.round(x / (this.cellSize.w + this.margin)),
                    y: Math.round(y / (this.cellSize.h + this.margin))
                }
            },
            updateLayout (layout) {
                this.$emit('update:layout', layout)
            },
            registerBox (box) {
                this.enableResizing(box)
                this.enableDragging(box)
                if (this.isMounted && this.autoAddLayoutForNewBox) {
                    this.createBoxLayout(box.$props.boxId)
                }
            },
            unregisterBox (box) {
            },
            enableDragging (box) {
                var initialLayout
                var isDragging = false

                let validateTargetPosition = (targetX, targetY) => {
                    if (targetX + this.dragging.boxLayout.position.w > this.maxColumnCount) {
                        targetX = this.maxColumnCount - this.dragging.boxLayout.position.w
                    } else {
                        if (targetX < 0) {
                            targetX = 0
                        }
                    }
                    if (targetY + this.dragging.boxLayout.position.h > this.maxRowCount) {
                        targetY = this.maxRowCount - this.dragging.boxLayout.position.h
                    } else {
                        if (targetY < 0) {
                            targetY = 0
                        }
                    }
                    return {
                        targetX,
                        targetY
                    }
                }

                box.$on('dragStart', evt => {
                    var boxLayout = this.getBoxLayoutById(box.boxId)
                    if (boxLayout.pinned) {
                        return
                    }
                    isDragging = true

                    // find box
                    this.dragging.boxLayout = boxLayout
                    this.placeholder = {
                        ...this.dragging.boxLayout
                    }

                    // clone layout
                    initialLayout = utils.sortLayout(this.layout)

                    this.$emit('drag:start', initialLayout)
                })

                box.$on('dragUpdate', evt => {
                    if (!isDragging) {
                        return
                    }
                    this.dragging.offset.x = evt.offset.x
                    this.dragging.offset.y = evt.offset.y

                    var moveBy = this.getPositionByPixel(evt.offset.x, evt.offset.y)
                    if (!utils.isFree(this.pinnedLayout, {
                        ...this.dragging.boxLayout.position,
                        x: this.dragging.boxLayout.position.x + moveBy.x,
                        y: this.dragging.boxLayout.position.y + moveBy.y
                    })) {
                        return
                    }

                    let { targetX, targetY } = validateTargetPosition(
                        this.dragging.boxLayout.position.x + moveBy.x,
                        this.dragging.boxLayout.position.y + moveBy.y
                    )

                    // check if box has moved
                    if (this.placeholder.position.x === targetX && this.placeholder.position.y === targetY) {
                        return
                    }
                    this.placeholder = utils.updateBoxPosition(this.placeholder, {
                        x: targetX,
                        y: targetY
                    })

                    var newLayout = [ this.placeholder ]
                    initialLayout.forEach((boxLayout) => {
                        if (boxLayout.id === this.dragging.boxLayout.id) {
                            return
                        }
                        newLayout.push(utils.moveBoxToFreePlace(newLayout, boxLayout, this.bubbleUp))
                    })

                    if (this.bubbleUp) {
                        newLayout = utils.layoutBubbleUp(newLayout)
                        this.placeholder = newLayout.find((boxLayout) => {
                            return boxLayout.id === this.dragging.boxLayout.id
                        })
                    }
                    this.updateLayout(newLayout)

                    this.$emit('drag:update', newLayout)
                })

                box.$on('dragEnd', evt => {
                    if (!isDragging) {
                        return
                    }
                    var moveBy = this.getPositionByPixel(evt.offset.x, evt.offset.y)
                    if (utils.isFree(this.pinnedLayout, {
                        ...this.dragging.boxLayout.position,
                        x: this.dragging.boxLayout.position.x + moveBy.x,
                        y: this.dragging.boxLayout.position.y + moveBy.y
                    })) {
                        let { targetX, targetY } = validateTargetPosition(
                            this.dragging.boxLayout.position.x + moveBy.x,
                            this.dragging.boxLayout.position.y + moveBy.y
                        )

                        this.placeholder = utils.updateBoxPosition(this.placeholder, {
                            x: targetX,
                            y: targetY
                        })
                    }

                    this.dragging.boxLayout = utils.updateBoxPosition(this.dragging.boxLayout, {
                        x: this.placeholder.position.x,
                        y: this.placeholder.position.y
                    })

                    var newLayout = [ this.dragging.boxLayout ]
                    initialLayout.forEach((boxPosition) => {
                        if (boxPosition.id === this.dragging.boxLayout.id) {
                            return
                        }
                        newLayout.push(utils.moveBoxToFreePlace(newLayout, boxPosition, this.bubbleUp))
                    })

                    if (this.bubbleUp) {
                        newLayout = utils.layoutBubbleUp(newLayout)
                    }

                    this.dragging.boxLayout = null
                    this.dragging.offset.x = 0
                    this.dragging.offset.y = 0

                    this.placeholder.hidden = true
                    isDragging = false

                    let newSize = utils.getLayoutSize(newLayout)

                    if(!this.dynamicResize && (newSize.w > this.maxColumnCount || newSize.h > this.maxRowCount)) {
                        newLayout = initialLayout // revert
                    }

                    this.updateLayout(newLayout)
                    this.$emit('drag:end', newLayout)
                })
            },
            enableResizing (box) {
                var initialLayout
                var isResizing = false

                let validateTargetSize = (targetW, targetH) => {
                    if (this.resizing.boxLayout.position.x + targetW > this.maxColumnCount) {
                        targetW = this.maxColumnCount - this.resizing.boxLayout.position.x
                    } else {
                        if (targetW < 1) {
                            targetW = 1
                        }
                    }
                    if (this.resizing.boxLayout.position.y + targetH > this.maxRowCount) {
                        targetH = this.maxRowCount - this.resizing.boxLayout.position.y
                    } else {
                        if (targetH < 1) {
                            targetH = 1
                        }
                    }
                    return {
                        targetW,
                        targetH
                    }
                }

                box.$on('resizeStart', evt => {
                    var boxLayout = this.getBoxLayoutById(box.boxId)
                    if (boxLayout.pinned) {
                        return
                    }
                    isResizing = true

                    // find box
                    this.resizing.boxLayout = boxLayout
                    this.placeholder = {
                        ...this.resizing.boxLayout
                    }

                    // clone layout
                    initialLayout = utils.sortLayout(this.layout)

                    this.$emit('resize:start', initialLayout)
                })

                box.$on('resizeUpdate', evt => {
                    if (!isResizing) {
                        return
                    }
                    this.resizing.offset.x = evt.offset.x
                    this.resizing.offset.y = evt.offset.y

                    var resizeBy = this.getPositionByPixel(evt.offset.x, evt.offset.y)
                    if (!utils.isFree(this.pinnedLayout, {
                        ...this.resizing.boxLayout.position,
                        w: this.resizing.boxLayout.position.w + resizeBy.x,
                        h: this.resizing.boxLayout.position.h + resizeBy.y
                    })) {
                        return
                    }

                    let { targetW, targetH } = validateTargetSize(
                        this.resizing.boxLayout.position.w + resizeBy.x,
                        this.resizing.boxLayout.position.h + resizeBy.y
                    )

                    // check if box size has changed
                    if (this.placeholder.position.w === targetW && this.placeholder.position.h === targetH) {
                        return
                    }
                    this.placeholder = utils.updateBoxPosition(this.placeholder, {
                        w: targetW,
                        h: targetH
                    })

                    var newLayout = [ this.placeholder ]
                    initialLayout.forEach((boxLayout) => {
                        if (boxLayout.id === this.resizing.boxLayout.id) {
                            return
                        }
                        newLayout.push(utils.moveBoxToFreePlace(newLayout, boxLayout, this.bubbleUp))
                    })

                    if (this.bubbleUp) {
                        newLayout = utils.layoutBubbleUp(newLayout)
                        this.placeholder = newLayout.find((boxLayout) => {
                            return boxLayout.id === this.resizing.boxLayout.id
                        })
                    }
                    this.updateLayout(newLayout)

                    this.$emit('resize:update', newLayout)
                })

                box.$on('resizeEnd', evt => {
                    if (!isResizing) {
                        return
                    }
                    var resizeBy = this.getPositionByPixel(evt.offset.x, evt.offset.y)
                    if (utils.isFree(this.pinnedLayout, {
                        ...this.resizing.boxLayout.position,
                        w: this.resizing.boxLayout.position.w + resizeBy.x,
                        h: this.resizing.boxLayout.position.h + resizeBy.y
                    })) {
                        let { targetW, targetH } = validateTargetSize(
                            this.resizing.boxLayout.position.w + resizeBy.x,
                            this.resizing.boxLayout.position.h + resizeBy.y
                        )

                        this.placeholder = utils.updateBoxPosition(this.placeholder, {
                            w: targetW,
                            h: targetH
                        })
                    }

                    this.resizing.boxLayout = utils.updateBoxPosition(this.resizing.boxLayout, {
                        w: this.placeholder.position.w,
                        h: this.placeholder.position.h
                    })

                    var newLayout = [ this.resizing.boxLayout ]
                    initialLayout.forEach((boxPosition) => {
                        if (boxPosition.id === this.resizing.boxLayout.id) {
                            return
                        }
                        newLayout.push(utils.moveBoxToFreePlace(newLayout, boxPosition, this.bubbleUp))
                    })

                    if (this.bubbleUp) {
                        newLayout = utils.layoutBubbleUp(newLayout)
                    }

                    this.resizing.boxLayout = null
                    this.resizing.offset.x = 0
                    this.resizing.offset.y = 0

                    this.placeholder.hidden = true

                    let newSize = utils.getLayoutSize(newLayout)

                    if(!this.dynamicResize && (newSize.w > this.maxColumnCount || newSize.h > this.maxRowCount)) {
                        newLayout = initialLayout // revert
                    }

                    this.updateLayout(newLayout)

                    this.$emit('resize:end', newLayout)
                })
            },
            createBoxLayout (...boxIds) {
                boxIds = boxIds.filter(boxId => !this.getBoxLayoutById(boxId))

                if (boxIds.length) {
                    let newLayout = [
                        ...this.layout
                    ]
                    boxIds.forEach(boxId => {
                        newLayout.push(utils.moveBoxToFreePlace(newLayout, {
                            id: boxId,
                            hidden: false,
                            position: {
                                x: 0,
                                y: 0,
                                ...this.defaultSize
                            }
                        }, this.bubbleUp))
                    })
                    this.updateLayout(newLayout)
                }
            }
        },
        created () {
            List.add(this)
        },
        mounted () {
            this.isMounted = true
            let boxIds = this.$children.map(box => box.$props.boxId)
            this.createBoxLayout(...boxIds)
        },
        beforeDestroy () {
            List.delete(this)
        }
    }
</script>
