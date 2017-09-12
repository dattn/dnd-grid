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
        transition: top ease-out 0.1s, left ease-out 0.1s, width ease-out 0.1s, height ease-out 0.1s;
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
                dragging: false,
                resizing: false
            }
        },
        computed: {
            style () {
                if (this.$parent.isBoxVisible(this.boxId)) {
                    var pixelPosition = this.$parent.getPixelPositionById(this.boxId)
                    return {
                        display: 'block',
                        width: pixelPosition.w + 'px',
                        height: pixelPosition.h + 'px',
                        left: pixelPosition.x + 'px',
                        top: pixelPosition.y + 'px'
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
        mounted () {
            // register component on parent
            this.$parent.registerBox(this.boxId)

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
            this.$parent.unregisterBox(this.boxId)
        }
    }
</script>
