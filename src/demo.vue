<template>
    <div class="container-fluid">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
        <h1>DEMO dnd-grid Vue.js Component</h1>

                <dnd-grid-container
                    :layout.sync="layout"
                    :gridSize="gridSize"
                    :margin="margin"
                    :bubbleUp="bubbleUp"
                >
                    <dnd-grid-box
                        boxId="settings"
                        dragSelector="div.card-header"
                    >
                        <div class="card demo-box">
                            <div class="card-header">
                                Settings
                            </div>
                            <div class="card-block">
                                <div class="form-group row">
                                    <label for="settings-margin-input" class="col-sm-4 col-form-label">Margin</label>
                                    <div class="col-sm-8">
                                        <input class="form-control" type="number" v-model.number="margin" id="settings-margin-input">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label for="settings-grid-size-w-input" class="col-sm-4 col-form-label">Grid Size</label>
                                    <div class="col-sm-4">
                                        <input class="form-control" type="number" v-model.number="gridSize.w" id="settings-grid-size-w-input">
                                    </div>
                                    <div class="col-sm-4">
                                        <input class="form-control" type="number" v-model.number="gridSize.h">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label for="settings-bubble-up-input" class="col-sm-4 col-form-label">Bubble Up</label>
                                    <div class="col-sm-8">
                                        <input type="checkbox" v-model="bubbleUp" id="settings-bubble-up-input">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </dnd-grid-box>
                    <dnd-grid-box
                        v-for="box in layoutWithoutSettings"
                        :boxId="box.id"
                        :key="box.id"
                        dragSelector="div.card-header"
                    >
                        <div class="card demo-box">
                            <div class="card-header">
                                Box {{ box.id }}
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
</style>

<script>
    import components from '../src/components'

    export default {
        components: {
            DndGridContainer: components.Container,
            DndGridBox: components.Box
        },

        data () {
            return {
                gridSize: {
                    w: 100,
                    h: 100
                },
                bubbleUp: false,
                margin: 5,
                layout: [
                    {
                        id: 'settings',
                        hidden: false,
                        pinned: false,
                        position: {
                            x: 0,
                            y: 0,
                            w: 4,
                            h: 3
                        }
                    },
                    {
                        id: 'a',
                        hidden: false,
                        pinned: false,
                        position: {
                            x: 4,
                            y: 0,
                            w: 2,
                            h: 1
                        }
                    },
                    {
                        id: 'b',
                        hidden: false,
                        pinned: false,
                        position: {
                            x: 6,
                            y: 0,
                            w: 1,
                            h: 2
                        }
                    },
                    {
                        id: 'c',
                        hidden: false,
                        pinned: false,
                        position: {
                            x: 4,
                            y: 1,
                            w: 2,
                            h: 3
                        }
                    },
                    {
                        id: 'd',
                        hidden: false,
                        pinned: false,
                        position: {
                            x: 6,
                            y: 2,
                            w: 3,
                            h: 1
                        }
                    }
                ]
            }
        },

        computed: {
            layoutWithoutSettings () {
                return this.layout.filter((box) => {
                    return box.id !== 'settings'
                })
            }
        },

        methods: {
            onLayoutUpdate (evt) {
                this.layout = evt.layout
            }
        }
    }
</script>
