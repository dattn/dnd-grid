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
        width: 15px;
        height: 15px;
        cursor: se-resize;
    }
</style>

<script>
    import * as utils from './utils'
    import { List as ContainerList } from './Container'

    export default {
        name: 'DndGridBox',
        props: {
            boxId: {
                required: true
            },
            dragSelector: {
                type: String,
                default: '*'
            }
        },
        data () {
            return {
                container: null,
                dragging: false,
                resizing: false
            }
        },
        computed: {
            style () {
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
            classes () {
                return {
                    'dnd-grid-box': true,
                    'dragging': this.dragging,
                    'resizing': this.resizing
                }
            }
        },
        methods: {
            findContainer () {
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
        mounted () {
            this.container = this.findContainer()
            if (!this.container) {
                throw new Error('Can not find container')
            }

            // register component on parent
            this.container.registerBox(this)

            // moving
            this.$dragHandle = this.$el || this.$refs.dragHandle
            this.$dragHandle.addEventListener('mousedown', evt => {
                if (!utils.matchesSelector(evt.target, this.dragSelector)) {
                    return
                }

                evt.preventDefault()
                this.dragging = true
                this.$emit('dragStart')
                let mouseX = evt.clientX
                let mouseY = evt.clientY

                const handleMouseUp = evt => {
                    window.removeEventListener('mouseup', handleMouseUp, true)
                    window.removeEventListener('mousemove', handleMouseMove, true)

                    this.dragging = false

                    var offset = {
                        x: evt.clientX - mouseX,
                        y: evt.clientY - mouseY
                    }
                    this.$emit('dragEnd', { offset })
                }

                const handleMouseMove = evt => {
                    var offset = {
                        x: evt.clientX - mouseX,
                        y: evt.clientY - mouseY
                    }
                    this.$emit('dragUpdate', { offset })
                }

                window.addEventListener('mouseup', handleMouseUp, true)
                window.addEventListener('mousemove', handleMouseMove, true)
            })

            // resizing
            this.$resizeHandle = this.$refs.resizeHandle
            if (this.$resizeHandle) {
                this.$resizeHandle.addEventListener('mousedown', evt => {
                    evt.preventDefault()
                    evt.stopPropagation()
                    this.resizing = true
                    this.$emit('resizeStart')
                    let mouseX = evt.clientX
                    let mouseY = evt.clientY

                    const handleMouseUp = evt => {
                        window.removeEventListener('mouseup', handleMouseUp, true)
                        window.removeEventListener('mousemove', handleMouseMove, true)

                        this.resizing = false

                        var offset = {
                            x: evt.clientX - mouseX,
                            y: evt.clientY - mouseY
                        }
                        this.$emit('resizeEnd', { offset })
                    }

                    const handleMouseMove = evt => {
                        var offset = {
                            x: evt.clientX - mouseX,
                            y: evt.clientY - mouseY
                        }
                        this.$emit('resizeUpdate', { offset })
                    }

                    window.addEventListener('mouseup', handleMouseUp, true)
                    window.addEventListener('mousemove', handleMouseMove, true)
                })
            }
        },
        beforeDestroy () {
            // register component on parent
            if (this.container) {
                this.container.unregisterBox(this)
            }
        }
    }
</script>
