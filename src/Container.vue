<template>
    <div
        class="dnd-grid-container"
        :style="style"
    >
        <slot></slot>
        <box
            class="placeholder"
            :x="placeholder.x"
            :y="placeholder.y"
            :w="placeholder.w"
            :h="placeholder.h"
            :show="placeholder.show"
            :boxId="placeholder"
        ></box>
    </div>
</template>

<style>
    .dnd-grid-container {
        position: relative;
        background-color: #F99;
        transition: min-width ease-out 0.1s, min-height ease-out 0.1s;
    }

    .dnd-grid-container .placeholder {
        border: 1px dashed #000;
        background: none;
        z-index: 0;
    }
</style>

<script>
    import Box from './Box';

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
            gridHeight: {
                type: Number,
                default: 100
            },
            gridWidth: {
                type: Number,
                default: 100
            },
            gridMargin: {
                type: Number,
                default: 5
            }
        },
        data() {
            return {
                placeholder: {
                    hide: true,
                    x: 0,
                    y: 0,
                    w: 1,
                    h: 1
                }
            }
        },
        computed: {
            style() {
                return {
                    minWidth: ((this.layout.reduce((acc, val) => {
                        return Math.max(acc, val.x + val.w);
                    }, this.placeholder.x + this.placeholder.w) * (this.gridWidth + this.gridMargin)) + this.gridMargin) + 'px',
                    minHeight: ((this.layout.reduce((acc, val) => {
                        return Math.max(acc, val.y + val.h);
                    }, this.placeholder.y + this.placeholder.h) * (this.gridHeight + this.gridMargin)) + this.gridMargin) + 'px'
                }
            }
        },
        methods: {
            boxData(boxId) {
                return this.layout.find(data => {
                    return data.id === boxId;
                });
            }
        },
        mounted() {
            this.$children.forEach(box => {
                box.$on('dragStart', evt => {
                    var data = this.boxData(box.boxId);
                    if (data) {
                        this.placeholder = {
                            ...data
                        };
                    }
                });
                box.$on('dragUpdate', evt => {
                    var data = this.boxData(box.boxId);
                    if (data) {
                        this.placeholder = {
                            ...data,
                            x: data.x + Math.round(evt.x / (this.gridWidth + this.gridMargin)),
                            y: data.y + Math.round(evt.y / (this.gridHeight + this.gridMargin))
                        }
                    }
                });
                box.$on('dragEnd', evt => {
                    var data = this.boxData(box.boxId);
                    if (data) {
                        data.x += Math.round(evt.x / this.gridWidth);
                        data.y += Math.round(evt.y / this.gridHeight);
                    }
                });
            });
        }
    }
</script>
