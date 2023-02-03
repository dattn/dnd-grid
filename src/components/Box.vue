<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { ContainerSymbol } from '../symbols.js'
import { inject } from 'vue'

const props = defineProps({
    boxId: {
        required: true,
        type: null
    }
})

const { boxId } = $(props)

const { getBoxLayout, computedCellSize, mode } = $(inject(ContainerSymbol))

const layout = $computed(() => getBoxLayout(boxId))
const visible = $computed(() => layout && !layout.hidden)

// grid mode
const cssColumn = $computed(() => (layout?.position?.x ?? 0) + 1)
const cssColumnSpan = $computed(() => layout?.position?.w ?? 1)
const cssRow = $computed(() => (layout?.position?.y ?? 0) + 1)
const cssRowSpan = $computed(() => layout?.position?.h ?? 1)

// layouting mode
const cssX = $computed(() => `${layout?.position?.x * (computedCellSize?.width + computedCellSize?.spacing)}px`)
const cssY = $computed(() => `${layout?.position?.y * (computedCellSize?.height + computedCellSize?.spacing)}px`)
const cssWidth = $computed(() => `${(layout?.position?.w * (computedCellSize?.width + computedCellSize?.spacing)) - computedCellSize?.spacing}px`)
const cssHeight = $computed(() => `${(layout?.position?.h * (computedCellSize?.height + computedCellSize?.spacing)) - computedCellSize?.spacing}px`)
</script>

<template>
    <div
        v-if="visible"
        class="dnd-grid__box"
        :class="`dnd-grid__box__mode-${mode}`"
    >
        <div class="dnd-grid__box__absolute-wrapper">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.dnd-grid__box {
    all: unset;
    grid-column: v-bind(cssColumn) / span v-bind(cssColumnSpan);
    grid-row: v-bind(cssRow) / span v-bind(cssRowSpan);
}

.dnd-grid__box.dnd-grid__box__mode-grid > .dnd-grid__box__absolute-wrapper {
    display: contents;
}

.dnd-grid__box.dnd-grid__box__mode-layouting > .dnd-grid__box__absolute-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: v-bind(cssWidth);
    height: v-bind(cssHeight);
    transform: translate(v-bind(cssX), v-bind(cssY));
}
</style>
