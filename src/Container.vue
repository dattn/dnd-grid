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
                var layoutSize = utils.getLayoutSize(this.layout);
                return {
                    minWidth: ((layoutSize.w * (this.gridSize.w + this.margin)) + this.margin) + 'px',
                    minHeight: ((layoutSize.h * (this.gridSize.h + this.margin)) + this.margin) + 'px'
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
                return utils.positionToPixels({ x, y, w, h }, this.gridSize, this.margin);
            },
            getPositionByPixel(x, y) {
                return {
                    x: Math.round(x / (this.gridSize.w + this.margin)),
                    y: Math.round(y / (this.gridSize.h + this.margin))
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
                    this.placeholder.x = Math.max(0, draggingBox.x + moveBy.x);
                    this.placeholder.y = Math.max(0, draggingBox.y + moveBy.y);

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
                    draggingBox.x = Math.max(0, draggingBox.x + moveBy.x);
                    draggingBox.y = Math.max(0, draggingBox.y + moveBy.y);

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
