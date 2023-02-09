<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { ContainerSymbol } from '../symbols.js'
import { inject, useCssModule } from 'vue'
import { updatePosition as updateBoxPosition } from '../utils/Box.js'
import { toPixels as positionToPixels, fromPixels as positionFromPixels } from '../utils/Position.js'
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

const slotContainerEl = $ref()
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
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-x')
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-y')
    },
    update: function onDragUpdate ({ offsetX, offsetY }) {
        let offsetPixels = { x: offsetX, y: offsetY, w: 0, h: 0 }
        applyOffsetPixels(startDragPosition, offsetPixels)
    }
})

let cssResizeX = $ref()
let cssResizeY = $ref()
let cssResizeWidth = $ref()
let cssResizeHeight = $ref()
let startResizePosition
let isResizing = $ref(false)
let resizeMode
const onResizeStart = useMouseHandler({
    start: function onResizeStart (_, evt) {
        startLayouting()
        resizeMode = evt?.target?.dataset?.resize || 'br'
        cssResizeX = cssX
        cssResizeY = cssY
        cssResizeWidth = cssWidth
        cssResizeHeight = cssHeight
        startResizePosition = position
        isResizing = true
    },
    stop: function onResizeStop () {
        stopLayouting()
        isResizing = false
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-width')
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-height')
    },
    update: function onResizeUpdate ({ offsetX, offsetY }) {
        let offsetPixels = { x: 0, y: 0, w: 0, h: 0 }

        switch (resizeMode?.[0]) {
            case 't': // top
                offsetPixels.y = offsetY
                offsetPixels.h = -offsetY
                break

            case 'b': // bottom
                offsetPixels.h = offsetY
                break
        }

        switch (resizeMode?.[1]) {
            case 'l': // left
                offsetPixels.x = offsetX
                offsetPixels.w = -offsetX
                break

            case 'r': // right
                offsetPixels.w = offsetX
                break
        }

        applyOffsetPixels(startResizePosition, offsetPixels)
    }
})

function applyOffsetPixels (basePosition, offsetPixels) {
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-x', `${offsetPixels.x}px`)
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-y', `${offsetPixels.y}px`)
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-width', `${offsetPixels.w}px`)
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-height', `${offsetPixels.h}px`)

    const halfCellSizeWidth = computedCellSize.width / 2
    const halfCellSizeHeight = computedCellSize.height / 2
    const targetPosition = positionFromPixels({
        x: offsetPixels.x + halfCellSizeWidth, // add half cellsize for better box placement
        y: offsetPixels.y + halfCellSizeHeight,
        w: offsetPixels.w + halfCellSizeWidth,
        h: offsetPixels.h + halfCellSizeHeight
    }, computedCellSize.width, computedCellSize.height, computedCellSize.spacing)
    targetPosition.x += basePosition.x
    targetPosition.y += basePosition.y
    targetPosition.w += basePosition.w
    targetPosition.h += basePosition.h

    updatePosition(targetPosition)
}

function updatePosition (targetPosition) {
    if (
        position.x !== targetPosition.x ||
        position.y !== targetPosition.y ||
        position.w !== targetPosition.w ||
        position.h !== targetPosition.h
    ) {
        updateBox(updateBoxPosition(box, targetPosition))
    }
}
</script>

<template>
    <div
        v-if="visible"
        ref="boxEl"
        :class="{
            [$style.box]: true,
            [$style.dragging]: isDragging,
            [$style.resizing]: isResizing
        }"
        @mousedown.stop="onDragStart"
    >
        <div
            ref="slotContainerEl"
            :class="$style.slotContainer"
        >
            <slot />
        </div>
        <div
            :class="$style.resizeHandleContainer"
            @mousedown.stop="onResizeStart"
        >
            <div data-resize="t-" />
            <div data-resize="-r" />
            <div data-resize="b-" />
            <div data-resize="-l" />
            <div data-resize="tl" />
            <div data-resize="tr" />
            <div data-resize="br" />
            <div data-resize="bl" />
        </div>
        <div
            v-if="isDragging || isResizing"
            :class="$style.placeholder"
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
    display: grid;
}

.box > * {
    grid-column: 1;
    grid-row: 1;
}
.mode-layouting .box {
    user-select: none;
}

.mode-layouting :is(.slotContainer, .placeholder) {
    position: absolute;
    left: v-bind(cssX);
    top: v-bind(cssY);
    width: v-bind(cssWidth);
    height: v-bind(cssHeight);
}

.mode-layouting .dragging  > .slotContainer {
    left: calc(v-bind(cssDragX) + var(--dnd-grid-box-offset-x, 0px));
    top: calc(v-bind(cssDragY) + var(--dnd-grid-box-offset-y, 0px));
}

.mode-layouting .resizing  > .slotContainer {
    left: calc(v-bind(cssResizeX) + var(--dnd-grid-box-offset-x, 0px));
    top: calc(v-bind(cssResizeY) + var(--dnd-grid-box-offset-y, 0px));
    width: calc(v-bind(cssResizeWidth) + var(--dnd-grid-box-offset-width, 0px));
    height: calc(v-bind(cssResizeHeight) + var(--dnd-grid-box-offset-height, 0px));
}

.mode-layouting .placeholder {
    background: #F002;
}

.mode-layouting :is(.dragging, .resizing) .slotContainer {
    z-index: 9999;
    opacity: 0.6;
}

.mode-layouting .box:not(.dragging):not(.resizing) > .slotContainer,
.mode-layouting .placeholder {
    transition-property: left, top, width, height;
    transition-duration: 0.1s;
    transition-timing-function: ease-out;
}

.slotContainer {
    z-index: 1;
}

.resizeHandleContainer {
    width: 100%;
    height: 100%;
    position: relative;
    --dnd-grid-resize-handler-size: 10px;
    --dnd-grid-resize-handler-offset: calc(var(--dnd-grid-resize-handler-size) / -2);
}

.resizeHandleContainer > * {
    position: absolute;
    width: var(--dnd-grid-resize-handler-size);
    height: var(--dnd-grid-resize-handler-size);
    z-index: 9999;
}

.resizeHandleContainer > [data-resize^=t] {
    top: var(--dnd-grid-resize-handler-offset);
}

.resizeHandleContainer > [data-resize^=b] {
    bottom: var(--dnd-grid-resize-handler-offset);
}

.resizeHandleContainer > [data-resize^='-'] {
    top: 0px;
    height: 100%;
}

.resizeHandleContainer > [data-resize$=l] {
    left: var(--dnd-grid-resize-handler-offset);
}

.resizeHandleContainer > [data-resize$=r] {
    right: var(--dnd-grid-resize-handler-offset);
}

.resizeHandleContainer > [data-resize$='-'] {
    left: 0px;
    width: 100%;
}

.resizeHandleContainer > :is([data-resize=t-], [data-resize=b-]) {
    cursor: ns-resize;
}

.resizeHandleContainer > :is([data-resize=-r], [data-resize=-l]) {
    cursor: ew-resize;
}

.resizeHandleContainer > :is([data-resize=tl], [data-resize=br]) {
    cursor: nwse-resize;
}

.resizeHandleContainer > :is([data-resize=tr], [data-resize=bl]) {
    cursor: nesw-resize;
}
</style>
