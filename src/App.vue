<script setup>
import GridContainer from './components/Container.vue'
import GridBox from './components/Box.vue'

let cellWidth = $ref()
let cellMaxWidth = $ref()
let cellHeight = $ref()
let cellMaxHeight = $ref()
let cellSpacing = $ref()
let enableLayout = $ref(true)
let bubbleUp = $ref(true)

const cellWidthInput = $computed(createInputComputed($$(cellWidth)))
const cellMaxWidthInput = $computed(createInputComputed($$(cellMaxWidth)))
const cellHeightInput = $computed(createInputComputed($$(cellHeight)))
const cellMaxHeightInput = $computed(createInputComputed($$(cellMaxHeight)))
const cellSpacingInput = $computed(createInputComputed($$(cellSpacing)))

function createInputComputed (targetRef) {
    return {
        get: () => targetRef.value,
        set: value => {
            targetRef.value = value === ''
                ? undefined
                : value
        }
    }
}

let layout = $ref([
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
])

let boxCount = $ref(4)
</script>

<template>
    <h1>DEMO dnd-grid Vue.js Component</h1>
    <div class="card demo-container">
        <GridContainer
            v-model:layout="layout"
            :cell-width="cellWidth"
            :cell-max-width="cellMaxWidth"
            :cell-height="cellHeight"
            :cell-max-height="cellMaxHeight"
            :cell-spacing="cellSpacing"
            :enable-layout="enableLayout"
            :bubble-up="bubbleUp"
        >
            <GridBox
                v-for="num in boxCount"
                :key="num"
                :box-id="num"
                drag-selector="div.card-header"
            >
                <div class="card demo-box">
                    <div class="card-header">
                        Box {{ num }}
                    </div>
                </div>
            </GridBox>

            <GridBox
                box-id="settings"
                drag-selector="div.card-header"
            >
                <div class="card demo-box">
                    <div class="card-header">
                        Settings
                    </div>
                    <div class="card-body">
                        <div class="form-group row">
                            <label
                                for="settings-margin-input"
                                class="col-sm-4 col-form-label"
                            >Enable Layout</label>
                            <div class="col-sm-8">
                                <input
                                    id="settings-margin-input"
                                    v-model="enableLayout"
                                    class="form-control"
                                    type="checkbox"
                                >
                            </div>
                        </div>
                        <div class="form-group row">
                            <label
                                for="settings-margin-input"
                                class="col-sm-4 col-form-label"
                            >Bubble Up</label>
                            <div class="col-sm-8">
                                <input
                                    id="settings-margin-input"
                                    v-model="bubbleUp"
                                    class="form-control"
                                    type="checkbox"
                                >
                            </div>
                        </div>
                        <div class="form-group row">
                            <label
                                for="settings-margin-input"
                                class="col-sm-4 col-form-label"
                            >Cell Spacing</label>
                            <div class="col-sm-8">
                                <input
                                    id="settings-margin-input"
                                    v-model="cellSpacingInput"
                                    class="form-control"
                                >
                            </div>
                        </div>
                        <div class="form-group row">
                            <label
                                for="settings-grid-size-w-input"
                                class="col-sm-4 col-form-label"
                            >Cell Size</label>
                            <div class="col-sm-4">
                                <input
                                    id="settings-grid-size-w-input"
                                    v-model="cellWidthInput"
                                    class="form-control"
                                >
                            </div>
                            <div class="col-sm-4">
                                <input
                                    v-model="cellHeightInput"
                                    class="form-control"
                                >
                            </div>
                        </div>
                        <div class="form-group row">
                            <label
                                for="settings-grid-size-w-input"
                                class="col-sm-4 col-form-label"
                            >Max Cell Size</label>
                            <div class="col-sm-4">
                                <input
                                    id="settings-grid-size-w-input"
                                    v-model="cellMaxWidthInput"
                                    class="form-control"
                                >
                            </div>
                            <div class="col-sm-4">
                                <input
                                    v-model="cellMaxHeightInput"
                                    class="form-control"
                                >
                            </div>
                        </div>
                        <button
                            class="btn btn-success"
                            @click="boxCount++"
                        >
                            Add Box
                        </button>
                        <button
                            class="btn btn-danger"
                            @click="boxCount = Math.max(0, boxCount - 1)"
                        >
                            Remove Box
                        </button>
                    </div>
                </div>
            </GridBox>
        </GridContainer>
    </div>
</template>

<style>
.demo-container {
    margin: 1em;
    padding: 1em;
    min-width: min-content;
    min-height: min-content;
}

.demo-box {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
