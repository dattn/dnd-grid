<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { provide, readonly, useCssModule, watch } from 'vue'
import { ContainerSymbol } from '../symbols.js'
import * as Layout from '../utils/Layout.js'
import * as Box from '../utils/Box.js'
import * as Position from '../utils/Position.js'

const props = defineProps({
    layout: {
        type: Array,
        default: () => []
    },

    cellWidth: {
        type: [Number, String],
        default: null
    },

    cellMaxWidth: {
        type: [Number, String],
        default: null
    },

    cellHeight: {
        type: [Number, String],
        default: null
    },

    cellMaxHeight: {
        type: [Number, String],
        default: null
    },

    cellSpacing: {
        type: [Number, String],
        default: null
    },

    bubbleUp: {
        type: Boolean,
        default: false
    },

    enableLayout: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits('update:layout')

const { layout: externalLayout, cellWidth, cellMaxWidth, cellHeight, cellMaxHeight, cellSpacing, bubbleUp, enableLayout } = $(props)

const $style = useCssModule()

const containerEl = $ref()
let computedCellSize = $ref()
let mode = $ref('grid')
let layout = $ref([])

const cssCellWidth = $computed(() => {
    if (cellWidth == undefined) return
    return isNaN(cellWidth) ? cellWidth : `${cellWidth}px`
})
const cssCellMaxWidth = $computed(() => {
    if (cellMaxWidth == undefined) return
    return isNaN(cellMaxWidth) ? cellMaxWidth : `${cellMaxWidth}px`
})
const cssCellHeight = $computed(() => {
    if (cellHeight == undefined) return
    return isNaN(cellHeight) ? cellHeight : `${cellHeight}px`
})
const cssCellMaxHeight = $computed(() => {
    if (cellMaxHeight == undefined) return
    return isNaN(cellMaxHeight) ? cellMaxHeight : `${cellMaxHeight}px`
})
const cssCellSpacing = $computed(() => {
    if (cellSpacing == undefined) return
    return isNaN(cellSpacing) ? cellSpacing : `${cellSpacing}px`
})

provide(ContainerSymbol, $$({
    layout: readonly(layout),
    mode: readonly(mode),
    enableLayout: readonly(enableLayout),
    computedCellSize: readonly(computedCellSize),
    startLayout,
    stopLayout,
    getBox,
    updateBox
}))

watch($$(externalLayout), () => {
    if (mode === 'grid') {
        layout = externalLayout
    }
}, {
    immediate: true
})

function updateComputedCellSize () {
    if (containerEl) {
        const style = getComputedStyle(containerEl)
        const width = parseFloat(style.gridTemplateColumns)
        const height = parseFloat(style.gridTemplateRows)
        const spacing = parseFloat(style.gap)

        computedCellSize = { width, height, spacing }
    }
    return computedCellSize
}

function startLayout () {
    updateComputedCellSize()
    layout = externalLayout
    mode = 'layout'
}

function stopLayout () {
    emit('update:layout', layout)
    layout = externalLayout
    mode = 'grid'
}

function getBox (id) {
    const box = Layout.getBox(layout, id)
    if (box) return box
    const newBox = Box.moveToFreePlace(layout, Box.create(id))
    layout = Layout.addOrReplaceBox(layout, newBox)
    return newBox
}

function updateBox (box) {
    if (!Position.isFree(externalLayout, box.position, box => box.static)) return // cannot overlap static boxes

    let newLayout = [box]
    externalLayout.forEach(_box => {
        if (_box.id === box.id) return
        newLayout.push(Box.moveToFreePlace(newLayout, _box))
    })
    if (bubbleUp) {
        newLayout = Layout.bubbleUp(newLayout)
    }
    layout = newLayout
}
</script>

<template>
    <div
        ref="containerEl"
        :class="{
            [$style.container]: true,
            [$style['mode-' + mode]]: true
        }"
        :style="{
            '--dnd-grid-cell-width': cssCellWidth,
            '--dnd-grid-cell-max-width': cssCellMaxWidth,
            '--dnd-grid-cell-height': cssCellHeight,
            '--dnd-grid-cell-max-height': cssCellMaxHeight,
            '--dnd-grid-cell-spacing': cssCellSpacing
        }"
    >
        <slot />
    </div>
</template>

<style module>
:where(.container) {
    all: unset;
}

.container {
    display: grid;
    position: relative;
    grid-auto-columns: minmax(
        var(--dnd-grid-cell-width, 8em),
        var(--dnd-grid-cell-max-width, 0)
    );
    grid-auto-rows: minmax(
        var(--dnd-grid-cell-height, 8em),
        var(--dnd-grid-cell-max-height, 0)
    );
    gap: var(--dnd-grid-cell-spacing, 0.5em);
    min-width: min-content;
    min-height: min-content;
    transition: min-width ease-out 0.1s, min-height ease-out 0.1s;
}

.mode-grid {

}
.mode-layout {

}
</style>
