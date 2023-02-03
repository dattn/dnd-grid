<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { ContainerSymbol } from '../symbols.js'
import { inject, onBeforeUnmount } from 'vue'

const props = defineProps({
    boxId: {
        required: true,
        type: null
    }
})

const { boxId } = $(props)

const { getBoxLayout, computedCellSize, mode, startLayouting, stopLayouting } = $(inject(ContainerSymbol))

const absoluteWrapperEl = $ref()
const boxEl = $ref()
let isMoving = $ref(false)

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

let moveStartX
let moveStartY

function startMoving (evt) {
    if (isMoving) return
    isMoving = true

    startLayouting()

    moveStartX = evt.clientX
    moveStartY = evt.clientY

    window.addEventListener('mouseup', stopMoving, { capture: true, passive: true, once: true })
    window.addEventListener('mousemove', onMove, { capture: true, passive: true })
}

function stopMoving () {
    if (!isMoving) return
    isMoving = false

    stopLayouting()

    window.removeEventListener('mouseup', stopMoving, { capture: true, passive: true, once: true })
    window.removeEventListener('mousemove', onMove, { capture: true, passive: true })

    absoluteWrapperEl?.style.removeProperty('--dnd-grid-box-offset-x')
    absoluteWrapperEl?.style.removeProperty('--dnd-grid-box-offset-y')
}

function onMove (evt) {
    absoluteWrapperEl.style.setProperty('--dnd-grid-box-offset-x', `${evt.clientX - moveStartX}px`)
    absoluteWrapperEl.style.setProperty('--dnd-grid-box-offset-y', `${evt.clientY - moveStartY}px`)
}

onBeforeUnmount(() => {
    stopMoving()
})
</script>

<template>
    <div
        v-if="visible"
        ref="boxEl"
        class="dnd-grid__box"
        :class="{
            [`dnd-grid__box__mode-${mode}`]: true,
            'dnd-grid__box__moving': isMoving
        }"
        @mousedown.capture.passive="startMoving"
    >
        <div
            ref="absoluteWrapperEl"
            class="dnd-grid__box__absolute-wrapper"
        >
            <slot />
        </div>
        <div
            v-if="isMoving"
            class="dnd-grid__box__layouting-result"
        />
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

.dnd-grid__box.dnd-grid__box__mode-layouting > .dnd-grid__box__absolute-wrapper,
.dnd-grid__box.dnd-grid__box__mode-layouting > .dnd-grid__box__layouting-result {
    position: absolute;
    left: v-bind(cssX);
    top: v-bind(cssY);
    width: v-bind(cssWidth);
    height: v-bind(cssHeight);
}

.dnd-grid__box.dnd-grid__box__mode-layouting > .dnd-grid__box__absolute-wrapper {
    transform: translate(var(--dnd-grid-box-offset-x, 0), var(--dnd-grid-box-offset-y, 0));
}

.dnd-grid__box.dnd-grid__box__mode-layouting > .dnd-grid__box__layouting-result {
    background-color: #F003;
}

.dnd-grid__box.dnd-grid__box__moving > .dnd-grid__box__absolute-wrapper {
    user-select: none;
    z-index: 9999;
}
</style>
