<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { provide, readonly, useCssModule, watch } from 'vue'
import { ContainerSymbol } from '../symbols.js'
import { getBox as _getBox, updateBox as _updateBox } from '../LayoutTools.js'

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

    disabled: {
        type: Boolean,
        default: false
    },

    isResizable: {
        type: Boolean,
        default: true,
    },

    isDraggable: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['update:layout'])

const { layout: externalLayout, cellWidth, cellMaxWidth, cellHeight, cellMaxHeight, cellSpacing, disabled, isDraggable, isResizable } = $(props)

const $style = useCssModule()

const containerEl = $ref()
let computedCellSize = $ref()
let mode = $ref('grid')
let layout = $ref(externalLayout)

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
    disabled: readonly(disabled),
    isResizable: readonly(isResizable),
    isDraggable: readonly(isDraggable),
    computedCellSize: readonly(computedCellSize),
    startLayout,
    stopLayout,
    getBox,
    updateBox
}))

watch($$(externalLayout), newLayout => {
    layout = newLayout
})

const layoutOptions = $computed(() => {
    return {
        bubbleUp: props.bubbleUp,
        startOnTop: false,
    }
})

function getBox (id) {
    return _getBox(layout, id, layoutOptions)
}

function updateBox (id, data) {
    return layout = _updateBox(externalLayout, id, data, layoutOptions)
}

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
    mode = 'layout'
}

function stopLayout () {
    emit('update:layout', layout)
    mode = 'grid'
}
</script>

<template>
    <div
        ref="containerEl"
        :class="{
            [$style.container]: true,
            [$style['mode-' + mode]]: true,
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
    width: 0;
    min-width: min-content;
    min-height: min-content;
}

.mode-grid {

}
.mode-layout {

}
</style>
