<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { ContainerSymbol } from '../symbols.js'
import { inject, useCssModule } from 'vue'
import { updatePosition } from '../utils/Box.js'
import { toPixels as positionToPixels } from '../utils/Position.js'
import useMouseHandler from '../composables/useMouseHandler.js'

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

let cssDragX = $ref()
let cssDragY = $ref()
let startDragPosition
let isDragging = $ref(false)
const onDragStart = useMouseHandler({
    start: function onDragStart () {
        startLayouting()
        cssDragX = cssX
        cssDragY = cssY
        startDragPosition = position
        isDragging = true
    },
    stop: function onDragStop () {
        stopLayouting()
        isDragging = false
        absoluteWrapperEl?.style?.removeProperty('--dnd-grid-box-offset-x')
        absoluteWrapperEl?.style?.removeProperty('--dnd-grid-box-offset-y')
    },
    update: function onDragUpdate ({ offsetX, offsetY }) {
        absoluteWrapperEl?.style?.setProperty('--dnd-grid-box-offset-x', `${offsetX}px`)
        absoluteWrapperEl?.style?.setProperty('--dnd-grid-box-offset-y', `${offsetY}px`)

        const targetX = startDragPosition.x + Math.round(offsetX / (computedCellSize?.width + computedCellSize?.spacing))
        const targetY = startDragPosition.y + Math.round(offsetY / (computedCellSize?.height + computedCellSize?.spacing))

        if (box.position.x !== targetX || box.position.y !== targetY) {
            updateBox(updatePosition(box, {
                x: targetX,
                y: targetY
            }))
        }
    }
})
</script>

<template>
    <div
        v-if="visible"
        ref="boxEl"
        :class="{
            [$style.box]: true,
            [$style.dragging]: isDragging
        }"
        @mousedown.passive="onDragStart"
    >
        <div
            ref="absoluteWrapperEl"
            :class="$style.absoluteWrapper"
        >
            <slot />
        </div>
        <div
            v-if="isDragging"
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

.mode-grid .absoluteWrapper {
    display: contents;
}

.mode-layouting .box {
    user-select: none;
}

.mode-layouting :is(.absoluteWrapper, .layoutingResult) {
    position: absolute;
    left: v-bind(cssX);
    top: v-bind(cssY);
    width: v-bind(cssWidth);
    height: v-bind(cssHeight);
}

.mode-layouting .dragging  > .absoluteWrapper {
    left: v-bind(cssDragX);
    top: v-bind(cssDragY);
    transform: translate(var(--dnd-grid-box-offset-x, 0), var(--dnd-grid-box-offset-y, 0));
}

.mode-layouting .layoutingResult {
    background-color: #F001;
}

.mode-layouting .dragging .absoluteWrapper {
    z-index: 9999;
}

.mode-layouting .box:not(.dragging) > .absoluteWrapper,
.mode-layouting .layoutingResult {
    transition: left ease-out 0.1s, top ease-out 0.1s, width ease-out 0.1s, height ease-out 0.1s;
}
</style>
