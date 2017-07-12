<template>
    <div
        class="dnd-grid-container"
        :style="style"
    >
        <slot></slot>
        <box
            class="placeholder"
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
        border: 1px dashed #000;
        background: none;
        z-index: 0;
    }

    .dnd-grid-container .dnd-grid-box.placeholder {
        transition: none !important;
    }
</style>

<script>
    import Box from './Box'
    import * as utils from './utils'

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
            gridSize: {
                type: Object,
                default: () => {
                    return {
                        w: 100,
                        h: 100
                    }
                }
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
                }
            }
        },
        computed: {
            style () {
                var layoutSize = utils.getLayoutSize(this.layout)
                return {
                    minWidth: (
                        (layoutSize.w * this.gridSize.w) +
                        ((layoutSize.w - 1) * this.margin) +
                        (2 * this.outerMargin)
                    ) + 'px',
                    minHeight: (
                        (layoutSize.h * this.gridSize.h) +
                        ((layoutSize.h - 1) * this.margin) +
                        (2 * this.outerMargin)
                    ) + 'px'
                }
            },
            pinnedLayout () {
                return this.layout.filter((boxLayout) => {
                    return boxLayout.pinned
                })
            }
        },
        methods: {
            getBoxLayoutById (id) {
                if (id === '::placeholder::') {
                    return this.placeholder
                }
                return this.layout.find(box => {
                    return box.id === id
                })
            },
            getPixelPositionById (id) {
                if (this.dragging.boxLayout && this.dragging.boxLayout.id === id) {
                    let pixels = utils.positionToPixels(this.dragging.boxLayout.position, this.gridSize, this.margin, this.outerMargin)
                    pixels.x += this.dragging.offset.x
                    pixels.y += this.dragging.offset.y
                    return pixels
                }

                if (this.resizing.boxLayout && this.resizing.boxLayout.id === id) {
                    let pixels = utils.positionToPixels(this.resizing.boxLayout.position, this.gridSize, this.margin, this.outerMargin)
                    pixels.w += this.resizing.offset.x
                    pixels.h += this.resizing.offset.y
                    return pixels
                }

                var boxLayout = this.getBoxLayoutById(id)
                return utils.positionToPixels(boxLayout.position, this.gridSize, this.margin, this.outerMargin)
            },
            isBoxVisible (id) {
                var boxLayout = this.getBoxLayoutById(id)
                return !boxLayout.hidden
            },
            getPositionByPixel (x, y) {
                return {
                    x: Math.round(x / (this.gridSize.w + this.margin)),
                    y: Math.round(y / (this.gridSize.h + this.margin))
                }
            },
            updateLayout (layout) {
                this.$emit('update:layout', layout)
            }
        },
        mounted () {
            this.$children.forEach(box => {
                var initialLayout
                var isDragging = false
                var isResizing = false

                box.$on('dragStart', evt => {
                    var boxLayout = this.getBoxLayoutById(box.boxId)
                    if (boxLayout.pinned) {
                        return
                    }
                    isDragging = true

                    // find box
                    this.dragging.boxLayout = boxLayout
                    this.placeholder = utils.cloneBoxLayout(this.dragging.boxLayout)

                    // clone layout
                    initialLayout = utils.sortLayout(utils.cloneLayout(this.layout))
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
                    this.placeholder.position.x = Math.max(0, this.dragging.boxLayout.position.x + moveBy.x)
                    this.placeholder.position.y = Math.max(0, this.dragging.boxLayout.position.y + moveBy.y)

                    var newLayout = [ this.placeholder ]
                    initialLayout.forEach((boxLayout) => {
                        if (boxLayout.id === this.dragging.boxLayout.id) {
                            return
                        }
                        newLayout.push(utils.moveToFreePlace(newLayout, boxLayout, this.bubbleUp))
                    })

                    if (this.bubbleUp) {
                        newLayout = utils.layoutBubbleUp(newLayout)
                    }
                    this.updateLayout(newLayout)
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
                        this.placeholder.position.x = Math.max(0, this.dragging.boxLayout.position.x + moveBy.x)
                        this.placeholder.position.y = Math.max(0, this.dragging.boxLayout.position.y + moveBy.y)
                    }

                    this.dragging.boxLayout.position.x = this.placeholder.position.x
                    this.dragging.boxLayout.position.y = this.placeholder.position.y

                    var newLayout = [ this.dragging.boxLayout ]
                    initialLayout.forEach((boxPosition) => {
                        if (boxPosition.id === this.dragging.boxLayout.id) {
                            return
                        }
                        newLayout.push(utils.moveToFreePlace(newLayout, boxPosition, this.bubbleUp))
                    })

                    if (this.bubbleUp) {
                        newLayout = utils.layoutBubbleUp(newLayout)
                    }
                    this.updateLayout(newLayout)

                    this.dragging.boxLayout = null
                    this.dragging.offset.x = 0
                    this.dragging.offset.y = 0

                    this.placeholder.hidden = true
                    isDragging = false
                })

                box.$on('resizeStart', evt => {
                    var boxLayout = this.getBoxLayoutById(box.boxId)
                    if (boxLayout.pinned) {
                        return
                    }
                    isResizing = true

                    // find box
                    this.resizing.boxLayout = boxLayout
                    this.placeholder = utils.cloneBoxLayout(this.resizing.boxLayout)

                    // clone layout
                    initialLayout = utils.sortLayout(utils.cloneLayout(this.layout))
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
                    this.placeholder.position.w = Math.max(1, this.resizing.boxLayout.position.w + resizeBy.x)
                    this.placeholder.position.h = Math.max(1, this.resizing.boxLayout.position.h + resizeBy.y)

                    var newLayout = [ this.placeholder ]
                    initialLayout.forEach((boxLayout) => {
                        if (boxLayout.id === this.resizing.boxLayout.id) {
                            return
                        }
                        newLayout.push(utils.moveToFreePlace(newLayout, boxLayout, this.bubbleUp))
                    })

                    if (this.bubbleUp) {
                        newLayout = utils.layoutBubbleUp(newLayout)
                    }
                    this.updateLayout(newLayout)
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
                        this.placeholder.position.w = Math.max(1, this.resizing.boxLayout.position.w + resizeBy.x)
                        this.placeholder.position.h = Math.max(1, this.resizing.boxLayout.position.h + resizeBy.y)
                    }

                    this.resizing.boxLayout.position.w = this.placeholder.position.w
                    this.resizing.boxLayout.position.h = this.placeholder.position.h

                    var newLayout = [ this.resizing.boxLayout ]
                    initialLayout.forEach((boxPosition) => {
                        if (boxPosition.id === this.resizing.boxLayout.id) {
                            return
                        }
                        newLayout.push(utils.moveToFreePlace(newLayout, boxPosition, this.bubbleUp))
                    })

                    if (this.bubbleUp) {
                        newLayout = utils.layoutBubbleUp(newLayout)
                    }
                    this.updateLayout(newLayout)

                    this.resizing.boxLayout = null
                    this.resizing.offset.x = 0
                    this.resizing.offset.y = 0

                    this.placeholder.hidden = true
                })
            })
        }
    }
</script>
