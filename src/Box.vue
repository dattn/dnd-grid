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
        border: 1px solid #999;
        box-sizing: border-box;
        background-color: #FFF;
    }

    .dnd-grid-box:not(.dragging) {
        transition: top ease-out 0.1s, left ease-out 0.1s;
    }
</style>

<script>
    export default {
        name: 'DndGridBox',
        props: {
            x: {
                type: Number,
                required: true
            },
            y: {
                type: Number,
                required: true
            },
            w: {
                type: Number,
                required: true
            },
            h: {
                type: Number,
                required: true
            },
            hide: {
                type: Boolean,
                default: false
            },
            boxId: {
                required: true
            }
        },
        data() {
            return {
                dragging: false
            }
        },
        computed: {
            style() {
                var pixelPosition = this.$parent.getPositionInPixel(this.x, this.y, this.w, this.h);
                return {
                    display: this.hide? 'none' : 'block',
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
                evt.preventDefault();
                var transition = this.$el.style.transition;
                this.dragging = true;
                this.$emit('dragStart');
                let x = evt.clientX;
                let y = evt.clientY;

                const handleMouseUp = evt => {
                    window.removeEventListener('mouseup', handleMouseUp, true);
                    window.removeEventListener('mousemove', handleMouseMove, true);

                    let offset = {
                        x: evt.clientX - x,
                        y: evt.clientY - y
                    };

                    this.dragging = false;
                    this.$emit('dragEnd', offset);

                    // force reposition on next tick
                    this.$nextTick(() => {
                        var pixelPosition = this.$parent.getPositionInPixel(this.x, this.y, this.w, this.h);
                        this.$el.style.left = pixelPosition.x + 'px';
                        this.$el.style.top = pixelPosition.y + 'px';
                    });
                };

                const handleMouseMove = evt => {
                    let offset = {
                        x: evt.clientX - x,
                        y: evt.clientY - y
                    };

                    var pixelPosition = this.$parent.getPositionInPixel(this.x, this.y, this.w, this.h);
                    this.$el.style.left = (pixelPosition.x + offset.x) + 'px';
                    this.$el.style.top = (pixelPosition.y + offset.y) + 'px';

                    this.$emit('dragUpdate', offset);
                };

                window.addEventListener('mouseup', handleMouseUp, true);
                window.addEventListener('mousemove', handleMouseMove, true);
            });
        }
    }
</script>
