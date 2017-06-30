<template>
    <div
        class="dnd-grid-container"
        :style="style"
    >
        <slot></slot>
        <box
            class="placeholder"
            boxId="placeholder"
        ></box>
    </div>
</template>

<style>
    .dnd-grid-container {
        position: relative;
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
                    position: {
                        x: 0,
                        y: 0,
                        w: 1,
                        h: 1
                    }
                },
                dragging: {
                    box: null,
                    offset: {
                        x: 0,
                        y: 0
                    }
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
            getBoxLayoutById(id) {
                if (id === 'placeholder') {
                    return this.placeholder;
                }
                return this.layout.find(box => {
                    return box.id === id;
                });
            },
            getPixelPositionById(id) {
                if (this.dragging.boxLayout && this.dragging.boxLayout.id === id) {
                    var pixels = utils.positionToPixels(this.dragging.boxLayout.position, this.gridSize, this.margin);
                    pixels.x += this.dragging.offset.x;
                    pixels.y += this.dragging.offset.y;
                    return pixels;
                }

                var boxLayout = this.getBoxLayoutById(id);
                return utils.positionToPixels(boxLayout.position, this.gridSize, this.margin);
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

                box.$on('dragStart', evt => {
                    // find box
                    this.dragging.boxLayout = this.getBoxLayoutById(box.boxId);
                    this.placeholder = utils.cloneBoxLayout(this.dragging.boxLayout);

                    // clone layout
                    initialLayout = utils.cloneLayout(this.layout)
                        .sort((a, b) => {
                            if (a.position.y < b.position.y) {
                                return -1;
                            }
                            if (a.position.y > b.position.y) {
                                return 1;
                            }
                            if (a.position.x < b.position.x) {
                                return -1;
                            }
                            if (a.position.x > b.position.x) {
                                return 1;
                            }
                            return 0;
                        });
                });

                box.$on('dragUpdate', evt => {
                    this.dragging.offset.x = evt.offset.x;
                    this.dragging.offset.y = evt.offset.y;

                    var moveBy = this.getPositionByPixel(evt.offset.x, evt.offset.y);
                    this.placeholder.position.x = Math.max(0, this.dragging.boxLayout.position.x + moveBy.x);
                    this.placeholder.position.y = Math.max(0, this.dragging.boxLayout.position.y + moveBy.y);

                    var newLayout = [ this.placeholder ];
                    initialLayout.forEach((boxLayout) => {
                        if (boxLayout.id === this.dragging.boxLayout.id) {
                            return;
                        }
                        newLayout.push(utils.moveToFreePlace(newLayout, boxLayout));
                    });
                    this.layout.splice(0, this.layout.length, ...newLayout);
                });

                box.$on('dragEnd', evt => {
                    var moveBy = this.getPositionByPixel(evt.offset.x, evt.offset.y);
                    this.dragging.boxLayout.position.x = Math.max(0, this.dragging.boxLayout.position.x + moveBy.x);
                    this.dragging.boxLayout.position.y = Math.max(0, this.dragging.boxLayout.position.y + moveBy.y);

                    var newLayout = [ this.dragging.boxLayout ];
                    initialLayout.forEach((boxPosition) => {
                        if (boxPosition.id === this.dragging.boxLayout.id) {
                            return;
                        }
                        newLayout.push(utils.moveToFreePlace(newLayout, boxPosition));
                    });
                    this.layout.splice(0, this.layout.length, ...newLayout);

                    this.dragging.boxLayout = null;
                    this.dragging.offset.x = 0;
                    this.dragging.offset.y = 0;
                });
            });
        }
    }
</script>
