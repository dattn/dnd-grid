<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { ContainerSymbol } from '../symbols.js'
import { inject, useCssModule } from 'vue'
import { updatePosition } from '../utils/Box.js'
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
        slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-x', `${offsetX}px`)
        slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-y', `${offsetY}px`)

        const { x, y } = positionFromPixels({
            x: offsetX + (computedCellSize.width / 2), // add half cell width for better box placement
            y: offsetY + (computedCellSize.height / 2) // add half cell height for better box placement
        }, computedCellSize.width, computedCellSize.height, computedCellSize.spacing)

        const targetX = startDragPosition.x + x
        const targetY = startDragPosition.y + y

        if (box.position.x !== targetX || box.position.y !== targetY) {
            updateBox(updatePosition(box, {
                x: targetX,
                y: targetY
            }))
        }
    }
})

let cssResizeWidth = $ref()
let cssResizeHeight = $ref()
let startResizePosition
let isResizing = $ref(false)
const onResizeStart = useMouseHandler({
    start: function onResizeStart () {
        startLayouting()
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
        slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-width', `${offsetX}px`)
        slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-height', `${offsetY}px`)

        const { w, h } = positionFromPixels({
            w: offsetX + (computedCellSize.width / 2), // add half cell width for better box placement
            h: offsetY + (computedCellSize.height / 2) // add half cell height for better box placement
        }, computedCellSize.width, computedCellSize.height, computedCellSize.spacing)

        const targetW = startResizePosition.w + w
        const targetH = startResizePosition.h + h

        if (box.position.w !== targetW || box.position.h !== targetH) {
            updateBox(updatePosition(box, {
                w: targetW,
                h: targetH
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
        <div :class="$style.resizeHandleContainer">
            <div
                :class="$style['resize-tl']"
                @mousedown.self.stop="onResizeStart"
            />
            <div
                :class="$style['resize-tr']"
                @mousedown.self.stop="onResizeStart"
            />
            <div
                :class="$style['resize-br']"
                @mousedown.self.stop="onResizeStart"
            />
            <div
                :class="$style['resize-bl']"
                @mousedown.self.stop="onResizeStart"
            />
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
    left: v-bind(cssDragX);
    top: v-bind(cssDragY);
    transform: translate(var(--dnd-grid-box-offset-x, 0px), var(--dnd-grid-box-offset-y, 0px));
}

.mode-layouting .resizing  > .slotContainer {
    width: calc(v-bind(cssResizeWidth) + var(--dnd-grid-box-offset-width, 0px));
    height: calc(v-bind(cssResizeHeight) + var(--dnd-grid-box-offset-height, 0px));
}

.mode-layouting .placeholder {
    background-color: #F001;
}

.mode-layouting :is(.dragging, .resizing) .slotContainer {
    z-index: 9999;
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
}

.resizeHandleContainer > * {
    position: absolute;
    width: 10px;
    height: 10px;
    z-index: 999999;
}

.resize-tl {
    top: -5px;
    left: -5px;
    cursor: nwse-resize;
}

.resize-tr {
    top: -5px;
    right: -5px;
    cursor: nesw-resize;
}

.resize-br {
    bottom: -5px;
    right: -5px;
    cursor: nwse-resize;
}

.resize-bl {
    bottom: -5px;
    left: -5px;
    cursor: nesw-resize;
}
</style>
