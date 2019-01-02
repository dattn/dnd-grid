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
    import Box from './Box.vue'
    import Widget from './widget'
    import Layout from './layout'
    import * as utils from './utils'

    let layoutHandler = null
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
            }
        },
        watch: {
            layout: {
                handler(to, from) {
                    if (this.doCommitLayout) {
                        layoutHandler.setNewLayout(this.layout)
                        this.doCommitLayout = false
                    }
                },
                deep: true
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
                isMounted: false,
                processingLayout: false,
                doCommitLayout: false
            }
        },
        computed: {
            style () {
                var layoutSize = layoutHandler.getLayoutSize(this.layout)
                return {
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
            addWidget(widget) {
                this.layout.push(widget)
                layoutHandler.updatePositions(widget).then(updatedLayout => {
                    this.processingLayout = false
                    this.updateLayout(updatedLayout)
                    layoutHandler.commit()
                })
            },
            commitLayout() {
                this.doCommitLayout = true
            },
            getBoxLayoutById(id) {
                if (id === '::placeholder::') {
                    return this.placeholder
                }
                let r = this.layoutMap.get(id)
                return r
            },
            getPixelPositionById(id) {
                let baseOn = null
                if (this.dragging.boxLayout && this.dragging.boxLayout.id === id) {
                    baseOn = this.dragging
                }

                if (this.resizing.boxLayout && this.resizing.boxLayout.id === id) {
                    baseOn = this.resizing
                }

                if (baseOn) {
                    let pixels = layoutHandler.positionToPixels(baseOn.boxLayout.position, this.cellSize, this.margin, this.outerMargin)
                    pixels.x += baseOn.offset.x
                    pixels.y += baseOn.offset.y
                    return pixels
                }

                var boxLayout = this.getBoxLayoutById(id)
                return layoutHandler.positionToPixels(boxLayout.position, this.cellSize, this.margin, this.outerMargin)
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
            enableDragging(box) {
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
                    var widget = this.getBoxLayoutById(box.boxId)
                    if (widget.pinned) {
                        return
                    }
                    isDragging = true

                    // find box
                    this.dragging.boxLayout = new Widget(widget)
                    this.placeholder = {
                        ...this.dragging.boxLayout
                    }

                    // update layout
                    layoutHandler.sortLayout()
                })

                box.$on('dragUpdate', evt => {
                    if (!isDragging) {
                        return
                    }
                    this.processingLayout = true
                    this.dragging.offset.x = evt.offset.x
                    this.dragging.offset.y = evt.offset.y

                    var moveBy = this.getPositionByPixel(evt.offset.x, evt.offset.y)

                    let input = {
                        x: this.dragging.boxLayout.position.x + moveBy.x,
                        y: this.dragging.boxLayout.position.y + moveBy.y
                    }
                    if (this.dragging.boxLayout.originalPosition) {
                        input = {
                            x: this.dragging.boxLayout.originalPosition.x + moveBy.x,
                            y: this.dragging.boxLayout.originalPosition.y + moveBy.y
                        }
                    }
                    let { targetX, targetY } = validateTargetPosition(
                        input.x,
                        input.y
                    )

                    // check if box has moved
                    if (this.placeholder.position.x === targetX && this.placeholder.position.y === targetY) {
                        return
                    }

                    let updateToPosition = {
                        x: targetX,
                        y: targetY,
                        w: this.placeholder.position.w,
                        h: this.placeholder.position.h
                        // w: !this.placeholder.minSize || this.placeholder.position.w > this.placeholder.minSize.w ? this.placeholder.position.w : this.placeholder.minSize.w,
                        // h: !this.placeholder.minSize || this.placeholder.position.h > this.placeholder.minSize.h ? this.placeholder.position.h : this.placeholder.minSize.h
                    }

                    layoutHandler.updatePositions(new Widget({
                        position: updateToPosition,
                        id: this.dragging.boxLayout.id
                    })).then(updatedLayout => {
                        this.processingLayout = false
                        this.updateLayout(updatedLayout)
                    })
                    this.placeholder = layoutHandler.movingBox
                })

                box.$on('dragEnd', evt => {
                    if (!isDragging) {
                        return
                    }

                    layoutHandler.commit()
                    this.dragging.boxLayout.position = this.placeholder.position
                    this.dragging.boxLayout = null
                    this.dragging.offset.x = 0
                    this.dragging.offset.y = 0
                    this.placeholder.hidden = true
                    isDragging = false
                })
            },
            enableResizing(box) {
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
                    var widget = this.getBoxLayoutById(box.boxId)
                    if (widget.pinned) {
                        return
                    }
                    isResizing = true

                    // find box
                    this.resizing.boxLayout = new Widget(widget)
                    this.placeholder = {
                        ...this.resizing.boxLayout
                    }

                    // update layout
                    layoutHandler.sortLayout()
                })

                box.$on('resizeUpdate', evt => {
                    if (!isResizing) {
                        return
                    }
                    this.processingLayout = true
                    this.resizing.offset.x = evt.offset.x
                    this.resizing.offset.y = evt.offset.y

                    var resizeBy = this.getPositionByPixel(evt.offset.x, evt.offset.y)

                    let input = {
                        w: this.resizing.boxLayout.position.w + resizeBy.x,
                        h: this.resizing.boxLayout.position.h + resizeBy.y
                    }
                    if (this.resizing.boxLayout.originalPosition) {
                        input = {
                            w: this.resizing.boxLayout.originalPosition.w + resizeBy.x,
                            h: this.resizing.boxLayout.originalPosition.h + resizeBy.y
                        }
                    }
                    let { targetW, targetH } = validateTargetSize(
                        input.w,
                        input.h
                    )

                    // check if box size has changed
                    if (this.placeholder.position.w === targetW && this.placeholder.position.h === targetH) {
                        return
                    }

                    let updateToPosition = {
                        x: this.placeholder.position.x,
                        y: this.placeholder.position.y,
                        w: targetW,
                        h: targetH
                    }

                    // Show updated size
                    // TODO: The box will be moved from its current x,y position with this change.
                    // this.resizing.boxLayout.position = updateToPosition

                    layoutHandler.updatePositions(new Widget({
                        position: updateToPosition,
                        id: this.resizing.boxLayout.id
                    })).then(updatedLayout => {
                        this.processingLayout = false
                        this.updateLayout(updatedLayout)
                    })
                    this.placeholder = layoutHandler.movingBox
                })

                box.$on('resizeEnd', evt => {
                    if (!isResizing) {
                        return
                    }

                    layoutHandler.commit()
                    this.resizing.boxLayout.position = this.placeholder.position
                    this.resizing.boxLayout = null
                    this.resizing.offset.x = 0
                    this.resizing.offset.y = 0
                    this.placeholder.hidden = true
                    isResizing = false
                })
            },
            createBoxLayout(...boxIds) {
                boxIds = boxIds.filter(boxId => !this.getBoxLayoutById(boxId))

                if (boxIds.length) {
                    let newLayout = [
                        ...this.layout
                    ]
                    boxIds.forEach(boxId => {
                        /*
                        newLayout.push(layoutHandler.moveBoxToFreePlace(newLayout, {
                            id: boxId,
                            hidden: false,
                            position: {
                                x: 0,
                                y: 0,
                                ...this.defaultSize
                            }
                        }))
                        */
                    })
                }
            }
        },
        created () {
            List.add(this)
            layoutHandler = new Layout(this.layout, {
                maxColumnCount: this.maxColumnCount
            })
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
