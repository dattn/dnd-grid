<template>
    <div class="container-fluid">
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous" />
        <h1>DEMO dnd-grid Vue.js Component</h1>

        <dnd-grid-container
            :layout.sync="layout"
            :gridSize="gridSize"
            :containerSize="containerSize"
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
                    <div class="card-body">
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
                        <button class="btn btn-success" @click="boxCount++">Add Box</button>
                        <button class="btn btn-danger" @click="boxCount = Math.max(0, boxCount-1)">Remove Box</button>
                    </div>
                </div>
            </dnd-grid-box>
            <dnd-grid-box
                v-for="number in boxCount"
                :boxId="number"
                :key="number"
                dragSelector="div.card-header"
            >
                <div class="card demo-box">
                    <div class="card-header">
                        Box {{ number }}
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
    import components from '../components'

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
                containerSize: {
                    w: null,
                    h: 24
                },
                bubbleUp: false,
                margin: 5,
                boxCount: 4,
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
                        id: 1,
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
                        id: 2,
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
                        id: 3,
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
                        id: 4,
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
