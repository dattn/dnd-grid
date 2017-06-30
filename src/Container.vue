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
                    x: 0,
                    y: 0,
                    w: 1,
                    h: 1
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
            getPositionById(id) {
                if (id === 'placeholder') {
                    return this.placeholder;
                }
                return this.layout.find(box => {
                    return box.id === id;
                });
            },
            getPixelPositionById(id) {
                if (this.dragging.box && this.dragging.box.id === id) {
                    var pixels = utils.positionToPixels(this.dragging.box, this.gridSize, this.margin);
                    pixels.x += this.dragging.offset.x;
                    pixels.y += this.dragging.offset.y;
                    return pixels;
                }

                var position = this.getPositionById(id);
                return utils.positionToPixels(position, this.gridSize, this.margin);
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
                var startPosition;

                box.$on('dragStart', evt => {
                    // find box
                    this.dragging.box = this.getPositionById(box.boxId);
                    startPosition = { ...this.dragging.box };
                    this.placeholder = { ...this.dragging.box };

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
                    this.dragging.offset.x = evt.offset.x;
                    this.dragging.offset.y = evt.offset.y;

                    var moveBy = this.getPositionByPixel(evt.offset.x, evt.offset.y);
                    this.placeholder.x = Math.max(0, this.dragging.box.x + moveBy.x);
                    this.placeholder.y = Math.max(0, this.dragging.box.y + moveBy.y);

                    var newLayout = [ this.placeholder ];
                    initialLayout.forEach((boxPosition) => {
                        if (boxPosition.id === this.dragging.box.id) {
                            return;
                        }
                        newLayout.push(utils.moveToFreePlace(newLayout, boxPosition));
                    });
                    this.layout.splice(0, this.layout.length, ...newLayout);
                });

                box.$on('dragEnd', evt => {
                    var moveBy = this.getPositionByPixel(evt.offset.x, evt.offset.y);
                    this.dragging.box.x = Math.max(0, this.dragging.box.x + moveBy.x);
                    this.dragging.box.y = Math.max(0, this.dragging.box.y + moveBy.y);

                    var newLayout = [ this.dragging.box ];
                    initialLayout.forEach((boxPosition) => {
                        if (boxPosition.id === this.dragging.box.id) {
                            return;
                        }
                        newLayout.push(utils.moveToFreePlace(newLayout, boxPosition));
                    });
                    this.layout.splice(0, this.layout.length, ...newLayout);

                    this.dragging.box = null;
                    this.dragging.offset.x = 0;
                    this.dragging.offset.y = 0;
                });
            });
        }
    }
</script>
