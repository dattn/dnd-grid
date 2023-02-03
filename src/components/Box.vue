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

const { getBoxLayout } = $(inject(ContainerSymbol))

const layout = $computed(() => getBoxLayout(boxId))
const visible = $computed(() => layout && !layout.hidden)
const x = $computed(() => (layout?.position?.x ?? 0) + 1)
const w = $computed(() => layout?.position?.w ?? 1)
const y = $computed(() => (layout?.position?.y ?? 0) + 1)
const h = $computed(() => layout?.position?.h ?? 1)
</script>

<template>
    <div
        v-if="visible"
        class="dnd-grid__box"
    >
        <slot />
    </div>
</template>

<style scoped>
.dnd-grid__box {
    all: unset;
    grid-column: v-bind(x) / span v-bind(w);
    grid-row: v-bind(y) / span v-bind(h);
}
</style>
