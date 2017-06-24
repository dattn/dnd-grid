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
                return {
                    display: this.hide? 'none' : 'block',
                    width: (this.w * this.$parent.gridWidth) + ((this.w - 1) * this.$parent.gridMargin) + 'px',
                    height: (this.h * this.$parent.gridHeight) + ((this.h - 1) * this.$parent.gridMargin) + 'px',
                    left: ((this.x * this.$parent.gridWidth) + ((this.x + 1) * this.$parent.gridMargin)) + 'px',
                    top: ((this.y * this.$parent.gridHeight) + ((this.y + 1) * this.$parent.gridMargin)) + 'px'
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
                        this.$el.style.left = ((this.x * this.$parent.gridWidth) + ((this.x + 1) * this.$parent.gridMargin)) + 'px';
                        this.$el.style.top = ((this.y * this.$parent.gridWidth) + ((this.y + 1) * this.$parent.gridMargin)) + 'px';
                    });
                };

                const handleMouseMove = evt => {
                    let offset = {
                        x: evt.clientX - x,
                        y: evt.clientY - y
                    };

                    this.$el.style.left = (((this.x * this.$parent.gridWidth) + ((this.x + 1) * this.$parent.gridMargin)) + offset.x) + 'px';
                    this.$el.style.top = (((this.y * this.$parent.gridWidth) + ((this.y + 1) * this.$parent.gridMargin)) + offset.y) + 'px';

                    this.$emit('dragUpdate', offset);
                };

                window.addEventListener('mouseup', handleMouseUp, true);
                window.addEventListener('mousemove', handleMouseMove, true);
            });
        }
    }
</script>
