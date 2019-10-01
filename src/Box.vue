<template>
    <div
        :class="classes"
        :style="style"
        ref="dragHandle"
    >
        <slot></slot>
        <div
            class="resize-handle"
            ref="resizeHandle"
        ></div>
    </div>
</template>

<style>
    .dnd-grid-box {
        position: absolute;
        z-index: 1;
        box-sizing: border-box;
    }

    .dnd-grid-box.dragging,
    .dnd-grid-box.resizing {
        z-index: 2;
        opacity: 0.7;
    }

    .dnd-grid-box:not(.dragging):not(.resizing) {
        transition: transform ease-out 0.1s, width ease-out 0.1s, height ease-out 0.1s;
    }

    .dnd-grid-box .resize-handle {
        position: absolute;
        right: -5px;
        bottom: -5px;
        width: 10px;
        height: 10px;
        cursor: se-resize;
        border-radius: 50%;
    }

    @media only screen and (max-width: 1366px) {
        .dnd-grid-box .resize-handle {
            width: 60px;
            height: 60px;
            bottom: -10px;
            right: -10px;
        }

        dnd-grid-box .resize-handle.resize-visible {
            background-color: rgba(100, 100, 100, .1);
        }
    }
</style>

<script>
    import * as utils from './utils'
    import { List as ContainerList } from './Container.vue'

    export default {
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
        data() {
            return {
                container: null,
                dragging: false,
                resizing: false
            }
        },
        computed: {
            style() {
                if (this.container && this.container.isBoxVisible(this.boxId)) {
                    var pixelPosition = this.container.getPixelPositionById(this.boxId)
                    return {
                        display: 'block',
                        width: pixelPosition.w + 'px',
                        height: pixelPosition.h + 'px',
                        transform: `translate(${pixelPosition.x}px, ${pixelPosition.y}px)`
                    }
                }

                return {
                    display: 'none'
                }
            },
            classes() {
                return {
                    'dnd-grid-box': true,
                    'dragging': this.dragging,
                    'resizing': this.resizing,
                    'resize.visible': this.resizeVisible
                }
            }
        },
        methods: {
            findContainer() {
                let current = this
                while (current.$parent) {
                    current = current.$parent
                    if (ContainerList.has(current)) {
                        return current
                    }
                }
                return null
            }
        },
        mounted() {
            this.container = this.findContainer()
            if (!this.container) {
                throw new Error('Can not find container')
            }

            // register component on parent
            this.container.registerBox(this)

            // moving
            this.$dragHandle = this.$el || this.$refs.dragHandle

            const startEvent = evt => {
                if (!utils.matchesSelector(evt.target, this.dragSelector)) {
                    return
                }

                evt.preventDefault()
                this.dragging = true
                this.$emit('dragStart')
                let positionX = evt.clientX || evt.touches[0].pageX
                let positionY = evt.clientY || evt.touches[0].pageY

                const handleEndDrag = evt => {
                    window.removeEventListener('mouseup', handleEndDrag, true)
                    window.removeEventListener('touchend', handleEndDrag, true)
                    window.removeEventListener('mousemove', handleMoveDrag, true)
                    window.removeEventListener('touchmove', handleMoveDrag, true)

                    this.dragging = false

                    var offset = {
                        x: (evt.clientX || evt.changedTouches[0].pageX) - positionX,
                        y: (evt.clientY || evt.changedTouches[0].pageY) - positionY
                    }
                    this.$emit('dragEnd', {offset})
                }

                const handleMoveDrag = evt => {
                    var offset = {
                        x: (evt.clientX || evt.touches[0].pageX) - positionX,
                        y: (evt.clientY || evt.touches[0].pageY) - positionY
                    }
                    this.$emit('dragUpdate', {offset})
                }

                window.addEventListener('mouseup', handleEndDrag, true)
                window.addEventListener('touchend', handleEndDrag, true)
                window.addEventListener('mousemove', handleMoveDrag, true)
                window.addEventListener('touchmove', handleMoveDrag, true)
            }

            this.$dragHandle.addEventListener('mousedown', startEvent)
            this.$dragHandle.addEventListener('touchstart', startEvent)

            // resizing
            this.$resizeHandle = this.$refs.resizeHandle
            if (this.$resizeHandle) {
                const resizeStart = evt => {
                    evt.preventDefault()
                    evt.stopPropagation()
                    this.resizing = true
                    this.$emit('resizeStart')
                    let positionX = evt.clientX || evt.touches[0].pageX
                    let positionY = evt.clientY || evt.touches[0].pageY

                    const handleEndResize = evt => {
                        window.removeEventListener('mouseup', handleEndResize, true)
                        window.removeEventListener('touchend', handleEndResize, true)
                        window.removeEventListener('mousemove', handleMoveResize, true)
                        window.removeEventListener('touchmove', handleMoveResize, true)

                        this.resizing = false

                        var offset = {
                            x: (evt.clientX || evt.changedTouches[0].pageX) - positionX,
                            y: (evt.clientY || evt.changedTouches[0].pageY) - positionY
                        }
                        this.$emit('resizeEnd', {offset})
                    }

                    const handleMoveResize = evt => {
                        var offset = {
                            x: (evt.clientX || evt.touches[0].pageX) - positionX,
                            y: (evt.clientY || evt.touches[0].pageY) - positionY
                        }
                        this.$emit('resizeUpdate', {offset})
                    }

                    window.addEventListener('mouseup', handleEndResize, true)
                    window.addEventListener('touchend', handleEndResize, true)
                    window.addEventListener('mousemove', handleMoveResize, true)
                    window.addEventListener('touchmove', handleMoveResize, true)
                }

                this.$resizeHandle.addEventListener('mousedown', resizeStart)
                this.$resizeHandle.addEventListener('touchstart', resizeStart)
            }
        },
        beforeDestroy() {
            // register component on parent
            if (this.container) {
                this.container.unregisterBox(this)
            }
        }
    }
</script>
