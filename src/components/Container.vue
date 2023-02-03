<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { provide, readonly } from 'vue'
import { ContainerSymbol } from '../symbols.js'

const props = defineProps({
    layout: {
        type: Object,
        default: () => ({})
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
    }
})

const { layout, cellWidth, cellMaxWidth, cellHeight, cellMaxHeight, cellSpacing } = $(props)

provide(ContainerSymbol, $$({
    layout: readonly(layout),
    getBoxLayout
}))

const layoutMap = $computed(() => {
    let map = new Map()
    layout.forEach(boxLayout => {
        map.set(boxLayout.id, boxLayout)
    })
    return map
})

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

function getBoxLayout (id) {
    return layoutMap.get(id)
}
</script>

<template>
    <div
        class="dnd-grid__container"
        :style="{
            '--dnd-grid-prop-cell-width': cssCellWidth,
            '--dnd-grid-prop-cell-max-width': cssCellMaxWidth,
            '--dnd-grid-prop-cell-height': cssCellHeight,
            '--dnd-grid-prop-cell-max-height': cssCellMaxHeight,
            '--dnd-grid-prop-cell-spacing': cssCellSpacing
        }"
    >
        <slot />
    </div>
</template>

<style scoped>
.dnd-grid__container {
    all: unset;
    display: grid;
    grid-auto-columns: minmax(
        var(--dnd-grid-prop-cell-width, var(--dnd-grid-cell-width, 8em)),
        var(--dnd-grid-prop-cell-max-width, var(--dnd-grid-cell-max-width, 0))
    );
    grid-auto-rows: minmax(
        var(--dnd-grid-prop-cell-height, var(--dnd-grid-cell-height, 8em)),
        var(--dnd-grid-prop-cell-max-height, var(--dnd-grid-cell-max-height, 0))
    );
    gap: var(--dnd-grid-prop-cell-spacing, var(--dnd-grid-cell-spacing, 0.5em));
    min-width: min-content;
    min-height: min-content;
    transition: min-width ease-out 0.1s, min-height ease-out 0.1s;
}
</style>
