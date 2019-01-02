<template>
    <div class="container-fluid">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
        <h1>DEMO dnd-grid Vue.js Component</h1>

        <div class="gallery">
            <dnd-gallery
                :class="{active: gallery.active}"
                :availableWidgets="widgets.available"
                @addWidget="addWidget"
            >
            </dnd-gallery>
        </div>

        <dnd-grid-container class="container"
            ref="layout"
            :layout.sync="widgets.current"
            :cellSize="cellSize"
            :maxColumnCount="maxColumnCount"
            :maxRowCount="maxRowCount"
            :margin="margin"
        >
            <dnd-grid-box
                v-for="w in widgets.current"
                :boxId="w.id"
                :key="w.id"
                dragSelector="div.card-header"
                @removeClicked="removeWidget(w.id)"
            >
                <div class="card demo-box">
                    <div class="card-header">
                        Box {{ w.id }}
                    </div>
                </div>
            </dnd-grid-box>
        </dnd-grid-container>
    </div>
</template>

<style>
    .demo-box {
        width: 100%;
        height: 100%;
    }

    .gallery {
        background: #bbb;
    }
</style>

<script>
    import { Container, Box, Widget, Gallery } from '../components'
    export default {
        components: {
            DndGridContainer: Container,
            DndGridBox: Box,
            DndGallery: Gallery
        },

        data () {
            return {
                cellSize: {
                    w: 100,
                    h: 100
                },
                maxColumnCount: 10,
                maxRowCount: Infinity,
                margin: 5,
                boxCount: 4,
                widgets: {
                    available: [new Widget({
                        'dashboardCompatibility': 'Airport, Terminal, Gate',
                        'id': 1,
                        'title': 'Add',
                        'description': 'Click here to add a new widget',
                        'hidden': false,
                        'minSize': {
                            'w': 1,
                            'h': 1
                        },
                        'position': {
                            'x': 0,
                            'y': 0,
                            'w': 4,
                            'h': 4
                        }
                    })],
                    current: [],
                    backup: []
                },
                gallery: {
                    active: true
                }
            }
        },

        created() {
            this.widgets.current = this.getLayout()
        },

        methods: {
            addWidget(widget) {
                this.$refs.layout.addWidget(widget)
            },
            removeWidget(id) {
                this.widgets.current = this.widgets.current.filter(widget => widget.id !== id)
                this.$refs.layout.commitLayout()
            },
            onLayoutUpdate (evt) {
                this.widgets.current = evt.layout
            },
            getLayout() {
                let layout = [
                    {
                        id: 0,
                        hidden: false,
                        position: {
                            x: 0,
                            y: 0,
                            w: 4,
                            h: 3
                        }
                    },
                    {
                        id: 1,
                        hidden: false,
                        position: {
                            x: 4,
                            y: 0,
                            w: 2,
                            h: 1
                        }
                    },
                    {
                        id: 2,
                        hidden: false,
                        position: {
                            x: 6,
                            y: 0,
                            w: 1,
                            h: 2
                        }
                    },
                    {
                        id: 3,
                        hidden: false,
                        position: {
                            x: 4,
                            y: 1,
                            w: 2,
                            h: 3
                        }
                    },
                    {
                        id: 4,
                        hidden: false,
                        position: {
                            x: 6,
                            y: 2,
                            w: 3,
                            h: 1
                        }
                    }
                ]
                return layout.map(o => {
                    return new Widget(o)
                })
            }
        }
    }
</script>
