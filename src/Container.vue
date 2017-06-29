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
    import * as utils from './utils';

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
            getBox(boxId) {
                return this.layout.find(box => {
                    return box.id === boxId;
                });
            },
            getPositionInPixel(x, y, w, h) {
                return {
                    w: (w * this.gridWidth) + ((w - 1) * this.gridMargin),
                    h: (h * this.gridHeight) + ((h - 1) * this.gridMargin),
                    x: (x * this.gridWidth) + ((x + 1) * this.gridMargin),
                    y: (y * this.gridHeight) + ((y + 1) * this.gridMargin)
                };
            },
            getPositionByPixel(x, y) {
                return {
                    x: Math.round(x / (this.gridWidth + this.gridMargin)),
                    y: Math.round(y / (this.gridHeight + this.gridMargin))
                }
            }
        },
        mounted() {
            this.$children.forEach(box => {
                var otherBoxes;
                var initialLayout;
                var draggingBox;

                box.$on('dragStart', evt => {
                    // find box
                    draggingBox = this.getBox(box.boxId);
                    this.placeholder = { ...draggingBox };

                    // clone layout
                    initialLayout = utils.cloneLayout(this.layout)
                        .sort((a, b) => {
                            if (a.y < b.y) {
                                return -1;
                            }
                            if (a.y > b.y) {
                                return 1;
                            }
                            if (a.x < b.x) {
                                return -1;
                            }
                            if (a.x > b.x) {
                                return 1;
                            }
                            return 0;
                        });
                });

                box.$on('dragUpdate', evt => {
                    var moveBy = this.getPositionByPixel(evt.x, evt.y);
                    this.placeholder.x = draggingBox.x + moveBy.x;
                    this.placeholder.y = draggingBox.y + moveBy.y;

                    var newLayout = [ this.placeholder ];
                    initialLayout.forEach((boxPosition) => {
                        if (boxPosition.id === draggingBox.id) {
                            return;
                        }
                        newLayout.push(utils.moveToFreePlace(newLayout, boxPosition));
                    });
                    this.layout.splice(0, this.layout.length, ...newLayout);
                });

                box.$on('dragEnd', evt => {
                    var moveBy = this.getPositionByPixel(evt.x, evt.y);
                    draggingBox.x += moveBy.x;
                    draggingBox.y += moveBy.y;

                    var newLayout = [ draggingBox ];
                    initialLayout.forEach((boxPosition) => {
                        if (boxPosition.id === draggingBox.id) {
                            return;
                        }
                        newLayout.push(utils.moveToFreePlace(newLayout, boxPosition));
                    });
                    this.layout.splice(0, this.layout.length, ...newLayout);
                });
            });
        }
    }
</script>
