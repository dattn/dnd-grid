<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { ContainerSymbol } from '../symbols.js'
import { inject, onBeforeUnmount, useCssModule } from 'vue'
import { updatePosition } from '../utils/Box.js'
import { toPixels as positionToPixels } from '../utils/Position.js'

const props = defineProps({
    boxId: {
        required: true,
        type: null
    }
})

const { boxId } = $(props)

const $style = useCssModule()

const { getBox, updateBox, computedCellSize, startLayouting, stopLayouting } = $(inject(ContainerSymbol))

const absoluteWrapperEl = $ref()
const boxEl = $ref()
let isMoving = $ref(false)

const box = $computed(() => getBox(boxId))
const visible = $computed(() => box && !box.hidden)

// grid mode
const position = $computed(() => box?.position)
const cssColumn = $computed(() => position == undefined ? undefined : position.x + 1)
const cssColumnSpan = $computed(() => position == undefined ? undefined : position.w)
const cssRow = $computed(() => position == undefined ? undefined : position.y + 1)
const cssRowSpan = $computed(() => position == undefined ? undefined : position.h)

// layouting mode
const pixels = $computed(() => {
    if (!position || !computedCellSize) return
    return positionToPixels(
        box.position,
        computedCellSize.width,
        computedCellSize.height,
        computedCellSize.spacing
    )
})
const cssX = $computed(() => pixels == undefined ? undefined : `${pixels.x}px`)
const cssY = $computed(() => pixels == undefined ? undefined : `${pixels.y}px`)
const cssWidth = $computed(() => pixels == undefined ? undefined : `${pixels.w}px`)
const cssHeight = $computed(() => pixels == undefined ? undefined : `${pixels.h}px`)

let cssMovingX
let cssMovingY
let startEvent
let startPosition

function startMoving (evt) {
    if (isMoving) return
    isMoving = true

    startLayouting()

    cssMovingX = cssX
    cssMovingY = cssY
    startEvent = evt
    startPosition = position

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
    const offsetX = evt.clientX - startEvent.clientX
    const offsetY = evt.clientY - startEvent.clientY

    absoluteWrapperEl.style.setProperty('--dnd-grid-box-offset-x', `${offsetX}px`)
    absoluteWrapperEl.style.setProperty('--dnd-grid-box-offset-y', `${offsetY}px`)

    const targetX = startPosition.x + Math.round(offsetX / (computedCellSize?.width + computedCellSize?.spacing))
    const targetY = startPosition.y + Math.round(offsetY / (computedCellSize?.height + computedCellSize?.spacing))

    if (box.position.x !== targetX || box.position.y !== targetY) {
        updateBox(updatePosition(box, {
            x: targetX,
            y: targetY
        }))
    }
}

onBeforeUnmount(() => {
    stopMoving()
})
</script>

<template>
    <div
        v-if="visible"
        ref="boxEl"
        :class="{
            [$style.box]: true,
            [$style.moving]: isMoving
        }"
        @mousedown.passive="startMoving"
    >
        <div
            ref="absoluteWrapperEl"
            :class="$style.absoluteWrapper"
        >
            <slot />
        </div>
        <div
            v-if="isMoving"
            :class="$style.layoutingResult"
        />
    </div>
</template>

<style module>
:where(.box) {
    all: unset;
}

.box {
    grid-column: v-bind(cssColumn) / span v-bind(cssColumnSpan);
    grid-row: v-bind(cssRow) / span v-bind(cssRowSpan);
}

.mode-grid .box > .absoluteWrapper {
    display: contents;
}

.mode-layouting .box > :is(.absoluteWrapper, .layoutingResult) {
    position: absolute;
    left: v-bind(cssX);
    top: v-bind(cssY);
    width: v-bind(cssWidth);
    height: v-bind(cssHeight);
}

.mode-layouting .box.moving  > .absoluteWrapper {
    left: v-bind(cssMovingX);
    top: v-bind(cssMovingY);
    transform: translate(var(--dnd-grid-box-offset-x, 0), var(--dnd-grid-box-offset-y, 0));
}

.mode-layouting .box > .layoutingResult {
    background-color: #F001;
}

.mode-layouting .box > .absoluteWrapper {
    user-select: none;
    z-index: 9999;
}

.mode-layouting .box:not(.moving) > .absoluteWrapper,
.mode-layouting .box > .layoutingResult {
    transition: left ease-out 0.1s, top ease-out 0.1s, width ease-out 0.1s, height ease-out 0.1s;
}
</style>
