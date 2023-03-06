<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { ContainerSymbol } from '../symbols.js'
import { inject, useCssModule } from 'vue'
import { toPixels, fromPixels } from '../LayoutTools.js'
import useDndHandler from '../composables/useDndHandler.js'

const props = defineProps({
    boxId: {
        required: true,
        type: null
    }
})

const { boxId } = $(props)

const $style = useCssModule()

const {
    getBox,
    updateBox,
    computedCellSize,
    startLayout,
    stopLayout,
    disabled,
    isResizable,
    isDraggable,
    canStartDrag,
    canStartResize
} = $(inject(ContainerSymbol))

const overlayEl = document.createElement('div')
overlayEl.classList.add($style.overlay)

const slotContainerEl = $ref()
const boxEl = $ref()

const box = $computed(() => getBox(boxId, true))
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
    return toPixels(
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

const isBoxResizable = $computed(() => {
    return !disabled // dnd is enabled
        && isResizable // resizing is enabled
        && (box?.isResizable ?? true) // box resizing is enabled (defaults to enabled)
        && (!box?.pinned || box?.isResizable) // pinned boxes can only be dragged when resizing is explicitly enabled
})

const isBoxDraggable = $computed(() => {
    return !disabled // dnd is enabled
        && isDraggable // dragging is enabled
        && (box?.isDraggable ?? true) // box dragging is enabled (defaults to enabled)
        && (!box?.pinned || box?.isDraggable) // pinned boxes can only be dragged when dragging is explicitly enabled
})

let baseCssPixels = $ref({})
let basePosition

let isDragging = $ref(false)
const dragEvents = useDndHandler({
    allow: function allowDrag (evt) {
        return isBoxDraggable && canStartDrag(evt) // check if evt is allowed to start dragging
    },
    start: function onDragStart () {
        startLayout()
        baseCssPixels = cssPixels
        basePosition = position
        isDragging = true

        document.body.appendChild(overlayEl)
        document.body.setAttribute('dnd-grid-drag', '')
    },
    stop: function onDragStop () {
        stopLayout()
        isDragging = false
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-left')
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-top')

        overlayEl.remove()
        document.body.removeAttribute('dnd-grid-drag')
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
        return isBoxResizable && canStartResize(evt)
    },
    start: function onResizeStart (_, evt) {
        startLayout()
        resizeMode = evt?.target?.getAttribute?.('dnd-grid-resize') || 'br'
        baseCssPixels = cssPixels
        basePosition = position
        isResizing = true

        document.body.appendChild(overlayEl)
        document.body.setAttribute('dnd-grid-resize', resizeMode)
    },
    stop: function onResizeStop () {
        stopLayout()
        isResizing = false
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-width')
        slotContainerEl?.style?.removeProperty('--dnd-grid-box-offset-height')

        overlayEl.remove()
        document.body.removeAttribute('dnd-grid-resize')
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

const boxEvents = $computed(() => {
    return mergeEvents(dragEvents, resizeEvents)
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
    const targetPosition = fromPixels({
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
        updateBox(box.id, { position: targetPosition })
    }
}

function mergeEvents (...eventObjects) {
    const eventMap = new Map()
    eventObjects.forEach(eventObject => {
        for (const key in eventObject) {
            const callbackList = eventMap.get(key) || eventMap.set(key, []).get(key)
            callbackList.push(eventObject[key])
        }
    })
    const mergedEvents = {}
    eventMap.forEach((callbacks, key) => {
        mergedEvents[key] = evt => callbacks.forEach(callback => callback(evt))
    })
    return mergedEvents
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
        v-on="boxEvents"
    >
        <div
            v-if="isDragging || isResizing"
            :class="$style.placeholderContainer"
        >
            <slot
                name="placeholder"
                v-bind="box"
            >
                <div :class="$style.placeholder" />
            </slot>
        </div>
        <div
            ref="slotContainerEl"
            :class="$style.slotContainer"
        >
            <slot v-bind="box" />
        </div>
        <div
            v-if="isBoxResizable"
            :class="$style.resizeHandleContainer"
        >
            <div dnd-grid-resize="t-" />
            <div dnd-grid-resize="-r" />
            <div dnd-grid-resize="b-" />
            <div dnd-grid-resize="-l" />
            <div dnd-grid-resize="tl" />
            <div dnd-grid-resize="tr" />
            <div dnd-grid-resize="br" />
            <div dnd-grid-resize="bl" />
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
    box-sizing: border-box;
    background: var(--dnd-grid-placeholder-background, #F002);
    border: var(--dnd-grid-placeholder-border, none);
}

.mode-layout :is(.dragging, .resizing) .slotContainer {
    z-index: 9999;
    opacity: 0.6;
}

.mode-layout .box:not(.dragging):not(.resizing) > .slotContainer,
.placeholderContainer {
    transition-property: left, top, width, height;
    transition-duration: var(--dnd-grid-transition-duration, 0.1s);
    transition-timing-function: var(--dnd-grid-transition-timing-function, ease-out);
}

.slotContainer {
    z-index: 1;
    overflow: hidden;
}

.resizeHandleContainer {
    width: 100%;
    height: 100%;
    position: relative;
    --dnd-grid-resize-handler-default-size: 10px;
    --dnd-grid-resize-handler-default-offset: calc(var(--dnd-grid-resize-handler-size, var(--dnd-grid-resize-handler-default-size)) / -2);
}

.resizeHandleContainer > * {
    position: absolute;
    width: var(--dnd-grid-resize-handler-size, var(--dnd-grid-resize-handler-default-size));
    height: var(--dnd-grid-resize-handler-size, var(--dnd-grid-resize-handler-default-size));
    z-index: 9999;
}

.resizeHandleContainer > [dnd-grid-resize^=t] {
    top: var(--dnd-grid-resize-handler-offset, var(--dnd-grid-resize-handler-default-offset));
}

.resizeHandleContainer > [dnd-grid-resize^=b] {
    bottom: var(--dnd-grid-resize-handler-offset, var(--dnd-grid-resize-handler-default-offset));
}

.resizeHandleContainer > [dnd-grid-resize^='-'] {
    top: 0px;
    height: 100%;
}

.resizeHandleContainer > [dnd-grid-resize$=l] {
    left: var(--dnd-grid-resize-handler-offset, var(--dnd-grid-resize-handler-default-offset));
}

.resizeHandleContainer > [dnd-grid-resize$=r] {
    right: var(--dnd-grid-resize-handler-offset, var(--dnd-grid-resize-handler-default-offset));
}

.resizeHandleContainer > [dnd-grid-resize$='-'] {
    left: 0px;
    width: 100%;
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
