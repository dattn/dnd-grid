<script setup>
import { shallowRef, computed } from 'vue'
import GridContainer from './components/Container.vue'
import GridBox from './components/Box.vue'
import initialLayout from './layout.json'
import * as l from './tools/layout.js'

const cellWidthRef = shallowRef()
const cellMaxWidthRef = shallowRef()
const cellHeightRef = shallowRef()
const cellMaxHeightRef = shallowRef()
const cellSpacingRef = shallowRef()
const disabledRef = shallowRef(false)
const bubbleUpRef = shallowRef(true)

const cellWidthInputRef = computed(createInputComputed(cellWidthRef))
const cellMaxWidthInputRef = computed(createInputComputed(cellMaxWidthRef))
const cellHeightInputRef = computed(createInputComputed(cellHeightRef))
const cellMaxHeightInputRef = computed(createInputComputed(cellMaxHeightRef))
const cellSpacingInputRef = computed(createInputComputed(cellSpacingRef))

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

const layoutRef = shallowRef(initialLayout)
const boxCountRef = shallowRef(4)

function addBox () {
    boxCountRef.value++
    layoutRef.value = l.addBox(layoutRef.value, l.createBox(layoutRef.value, boxCountRef.value))
}

function removeBox () {
    if (boxCountRef.value > 0) {
        layoutRef.value = l.removeBox(layoutRef.value, boxCountRef.value)
        boxCountRef.value--
    }
}
</script>

<template>
    <h1>DEMO dnd-grid Vue.js Component</h1>
    <div class="card demo-container">
        <GridContainer
            v-model:layout="layoutRef"
            :cell-width="cellWidthRef"
            :cell-max-width="cellMaxWidthRef"
            :cell-height="cellHeightRef"
            :cell-max-height="cellMaxHeightRef"
            :cell-spacing="cellSpacingRef"
            :disabled="disabledRef"
            :bubble-up="bubbleUpRef"
        >
            <GridBox
                v-for="num in boxCountRef"
                :key="num"
                v-slot="box"
                :box-id="num"
            >
                <div class="card demo-box">
                    <div
                        class="card-header"
                        :dnd-grid-drag="box.pinned ? null : ''"
                    >
                        Box id:{{ box.id }}
                        <template v-if="box.pinned">
                            (pinned)
                        </template>
                    </div>
                </div>
            </GridBox>

            <GridBox
                v-slot="box"
                box-id="settings"
            >
                <div class="card demo-box">
                    <div
                        class="card-header"
                        dnd-grid-drag
                    >
                        Settings id:{{ box.id }}
                        <template v-if="box.pinned">
                            (pinned)
                        </template>
                    </div>
                    <div class="card-body">
                        <div class="form-group row">
                            <label
                                for="settings-margin-input"
                                class="col-sm-4 col-form-label"
                            >Disabled</label>
                            <div class="col-sm-8">
                                <input
                                    id="settings-margin-input"
                                    v-model="disabledRef"
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
                                    v-model="bubbleUpRef"
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
                                    v-model="cellSpacingInputRef"
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
                                    v-model="cellWidthInputRef"
                                    class="form-control"
                                >
                            </div>
                            <div class="col-sm-4">
                                <input
                                    v-model="cellHeightInputRef"
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
                                    v-model="cellMaxWidthInputRef"
                                    class="form-control"
                                >
                            </div>
                            <div class="col-sm-4">
                                <input
                                    v-model="cellMaxHeightInputRef"
                                    class="form-control"
                                >
                            </div>
                        </div>
                        <button
                            class="btn btn-success"
                            @click="addBox"
                        >
                            Add Box
                        </button>
                        <button
                            class="btn btn-danger"
                            @click="removeBox"
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
