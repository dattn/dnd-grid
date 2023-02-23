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
import useDndHandler from '../composables/useDndHandler.js'

const props = defineProps({
    boxId: {
        required: true,
        type: null
    }
})

const { boxId } = $(props)

const $style = useCssModule()

const { getBox, updateBox, computedCellSize, startLayout, stopLayout, enableLayout } = $(inject(ContainerSymbol))

const overlayEl = document.createElement('div')
overlayEl.classList.add($style.overlay)

const slotContainerEl = $ref()
const boxEl = $ref()

const box = $computed(() => getBox(boxId))
const visible = $computed(() => box && !box.hidden)

// grid mode
const position = $computed(() => box?.position)
const cssPosition = $computed(() => {
    return {
        x: (position?.x ?? 0) + 1,
        y: (position?.y ?? 0) + 1,
        w: position?.w ?? 0,
        h: position?.h ?? 0
    }
})

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
const cssPixels = $computed(() => {
    return {
        x: `${pixels?.x ?? 0}px`,
        y: `${pixels?.y ?? 0}px`,
        w: `${pixels?.w ?? 0}px`,
        h: `${pixels?.h ?? 0}px`
    }
})

let baseCssPixels = $ref({})
let basePosition

let isDragging = $ref(false)
const dragEvents = useDndHandler({
    allow: function allowDrag (evt) {
        return canStartlayout(evt)
    },
    start: function onDragStart () {
        startLayout()
        baseCssPixels = cssPixels
        basePosition = position
        isDragging = true

        document.body.appendChild(overlayEl)
        document.body.classList.add($style['cursor-grabbing'])
    },
    stop: function onDragStop () {
        stopLayout()
        isDragging = false
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-left')
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-top')

        overlayEl.remove()
        document.body.classList.remove($style['cursor-grabbing'])
    },
    update: function onDragUpdate ({ offsetX, offsetY }) {
        let offsetPixels = { x: offsetX, y: offsetY, w: 0, h: 0 }
        applyOffsetPixels(basePosition, offsetPixels)
    }
})

let isResizing = $ref(false)
let resizeMode
const resizeEvents = useDndHandler({
    allow: function allowResize (evt) {
        return canStartlayout(evt)
    },
    start: function onResizeStart (_, evt) {
        startLayout()
        resizeMode = evt?.target?.dataset?.resize
        baseCssPixels = cssPixels
        basePosition = position
        isResizing = true

        document.body.appendChild(overlayEl)
        document.body.dataset.resize = resizeMode
    },
    stop: function onResizeStop () {
        stopLayout()
        isResizing = false
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-width')
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-height')

        overlayEl.remove()
        delete document.body.dataset.resize
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

        applyOffsetPixels(basePosition, offsetPixels)
    }
})

function applyOffsetPixels (basePosition, offsetPixels) {
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-left', `${offsetPixels.x}px`)
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-top', `${offsetPixels.y}px`)
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-width', `${offsetPixels.w}px`)
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-height', `${offsetPixels.h}px`)

    slotContainerEl?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
    })

    const halfCellSizeWidth = computedCellSize.width / 2
    const halfCellSizeHeight = computedCellSize.height / 2
    const targetPosition = positionFromPixels({
        x: offsetPixels.x + halfCellSizeWidth, // add half cellsize for better box placement
        y: offsetPixels.y + halfCellSizeHeight,
        w: offsetPixels.w + halfCellSizeWidth,
        h: offsetPixels.h + halfCellSizeHeight
    }, computedCellSize.width, computedCellSize.height, computedCellSize.spacing)

    targetPosition.x = Math.max(0, targetPosition.x + basePosition.x)
    targetPosition.y = Math.max(0, targetPosition.y + basePosition.y)
    targetPosition.w = Math.max(1, targetPosition.w + basePosition.w)
    targetPosition.h = Math.max(1, targetPosition.h + basePosition.h)

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

function canStartlayout (evt) {
    return enableLayout && !box.static && !evt.target.matches(':is(input, button, select, a[href])')
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
        v-on="dragEvents"
    >
        <div
            ref="slotContainerEl"
            :class="$style.slotContainer"
        >
            <slot v-bind="box" />
        </div>
        <div
            v-if="enableLayout"
            :class="$style.resizeHandleContainer"
            v-on="resizeEvents"
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
            :class="$style.placeholderContainer"
        >
            <slot name="placeholder" v-bind="box">
                <div :class="$style.placeholder"></div>
            </slot>
        </div>
    </div>
</template>

<style module>
:where(.box) {
    all: unset;
}

.box {
    grid-column: v-bind('cssPosition.x') / span v-bind('cssPosition.w');
    grid-row: v-bind('cssPosition.y') / span v-bind('cssPosition.h');
    display: grid;
}

.box > * {
    grid-column: 1;
    grid-row: 1;
}
.mode-layout .box {
    user-select: none;
}

.mode-layout :is(.slotContainer, .placeholderContainer) {
    position: absolute;
    left: v-bind('cssPixels.x');
    top: v-bind('cssPixels.y');
    width: v-bind('cssPixels.w');
    height: v-bind('cssPixels.h');
}

.mode-layout :is(.dragging, .resizing)  > .slotContainer {
    left: calc(v-bind('baseCssPixels.x') + var(--dnd-grid-box-offset-left, 0px));
    top: calc(v-bind('baseCssPixels.y') + var(--dnd-grid-box-offset-top, 0px));
    width: calc(v-bind('baseCssPixels.w') + var(--dnd-grid-box-offset-width, 0px));
    height: calc(v-bind('baseCssPixels.h') + var(--dnd-grid-box-offset-height, 0px));
}
.placeholder {
    width: 100%;
    height: 100%;
    background: #F002;
}

.mode-layout :is(.dragging, .resizing) .slotContainer {
    z-index: 9999;
    opacity: 0.6;
}

.mode-layout .box:not(.dragging):not(.resizing) > .slotContainer,
.placeholderContainer {
    transition-property: left, top, width, height;
    transition-duration: 0.1s;
    transition-timing-function: ease-out;
}

.slotContainer {
    z-index: 1;
    overflow: hidden;
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

:is([data-resize=t-], [data-resize=b-]) {
    cursor: ns-resize;
}

:is([data-resize=-r], [data-resize=-l]) {
    cursor: ew-resize;
}

:is([data-resize=tl], [data-resize=br]) {
    cursor: nwse-resize;
}

:is([data-resize=tr], [data-resize=bl]) {
    cursor: nesw-resize;
}

.cursor-grabbing {
    cursor: grabbing;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999999;
}
</style>
