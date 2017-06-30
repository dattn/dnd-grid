<template>
    <div
        :class="classes"
        :style="style"
        ref="dragHandle"
    >
        <slot></slot>
    </div>
</template>

<style>
    .dnd-grid-box {
        position: absolute;
        z-index: 1;
        box-sizing: border-box;
    }

    .dnd-grid-box.dragging {
        z-index: 2;
    }

    .dnd-grid-box:not(.dragging) {
        transition: top ease-out 0.1s, left ease-out 0.1s;
    }
</style>

<script>
    import * as utils from './utils';

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
        data() {
            return {
                dragging: false
            }
        },
        computed: {
            style() {
                var pixelPosition = this.$parent.getPixelPositionById(this.boxId);
                var visible = this.$parent.isBoxVisible(this.boxId);
                return {
                    display: visible? 'block' : 'none',
                    width: pixelPosition.w + 'px',
                    height: pixelPosition.h + 'px',
                    left: pixelPosition.x + 'px',
                    top: pixelPosition.y + 'px'
                }
            },
            classes() {
                return {
                    'dnd-grid-box': true,
                    'dragging': this.dragging
                }
            }
        },
        mounted() {
            this.$dragHandle = this.$el || this.$refs.dragHandle;
            this.$dragHandle.addEventListener('mousedown', evt => {
                if (!utils.matchesSelector(evt.target, this.dragSelector)) {
                    return;
                }

                evt.preventDefault();
                var transition = this.$el.style.transition;
                this.dragging = true;
                this.$emit('dragStart');
                let mouseX = evt.clientX;
                let mouseY = evt.clientY;

                const handleMouseUp = evt => {
                    window.removeEventListener('mouseup', handleMouseUp, true);
                    window.removeEventListener('mousemove', handleMouseMove, true);

                    this.dragging = false;

                    var offset = {
                        x: evt.clientX - mouseX,
                        y: evt.clientY - mouseY
                    };
                    this.$emit('dragEnd', { offset });
                };

                const handleMouseMove = evt => {
                    var offset = {
                        x: evt.clientX - mouseX,
                        y: evt.clientY - mouseY
                    };
                    this.$emit('dragUpdate', { offset });
                };

                window.addEventListener('mouseup', handleMouseUp, true);
                window.addEventListener('mousemove', handleMouseMove, true);
            });
        }
    }
</script>
