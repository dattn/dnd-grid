<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
import { ContainerSymbol } from '../symbols.js'
import { inject, useCssModule, shallowRef, computed } from 'vue'
import { toPixels, fromPixels } from '../LayoutTools.js'
import useDndHandler from '../composables/useDndHandler.js'

const props = defineProps({
    boxId: {
        required: true,
        type: null
    },

    overflow: {
        type: String,
        default: 'hidden'
    }
})

const $style = useCssModule()

const {
    computedCellSize: computedCellSizeRef,
    disabled: disabledRef,
    isResizable: isResizableRef,
    isDraggable: isDraggableRef,
    addResizeHandles: addResizeHandlesRef,
    canStartDrag,
    canStartResize,
    getBox,
    updateBox,
    startLayout,
    stopLayout,
} = inject(ContainerSymbol)

const overlayEl = document.createElement('div')
overlayEl.classList.add($style.overlay)

const slotContainerElRef = shallowRef()
const boxElRef = shallowRef()

const boxRef = computed(() => getBox(props.boxId, true))
const visibleRef = computed(() => !(boxRef.value?.hidden ?? false))

// grid mode
const positionRef = computed(() => boxRef.value?.position)
const cssPositionRef = computed(() => {
    return {
        '--dnd-grid-box-x': (positionRef.value?.x ?? 0) + 1,
        '--dnd-grid-box-y': (positionRef.value?.y ?? 0) + 1,
        '--dnd-grid-box-width': positionRef.value?.w ?? 0,
        '--dnd-grid-box-height': positionRef.value?.h ?? 0
    }
})

// layouting mode
const pixelsRef = computed(() => {
    if (!positionRef.value || !computedCellSizeRef.value) return
    const { width, height, spacing } = computedCellSizeRef.value
    return toPixels(
        boxRef.value.position,
        width,
        height,
        spacing
    )
})
const cssPixelsRef = computed(() => {
    return {
        x: `${pixelsRef.value?.x ?? 0}px`,
        y: `${pixelsRef.value?.y ?? 0}px`,
        w: `${pixelsRef.value?.w ?? 0}px`,
        h: `${pixelsRef.value?.h ?? 0}px`
    }
})

const isBoxResizableRef = computed(() => {
    return !disabledRef.value // dnd is enabled
        && isResizableRef.value // resizing is enabled
        && (boxRef.value?.isResizable ?? true) // box resizing is enabled (defaults to enabled)
        && (!boxRef.value?.pinned || boxRef.value?.isResizable) // pinned boxes can only be dragged when resizing is explicitly enabled
})

const isBoxDraggableRef = computed(() => {
    return !disabledRef.value // dnd is enabled
        && isDraggableRef.value // dragging is enabled
        && (boxRef.value?.isDraggable ?? true) // box dragging is enabled (defaults to enabled)
        && (!boxRef.value?.pinned || boxRef.value?.isDraggable) // pinned boxes can only be dragged when dragging is explicitly enabled
})

const baseCssPixelsRef = shallowRef({})
let basePosition

const isDraggingRef = shallowRef(false)
const dragEvents = useDndHandler({
    allow: function allowDrag (evt) {
        return isBoxDraggableRef.value && canStartDrag(evt) // check if evt is allowed to start dragging
    },
    start: function onDragStart () {
        startLayout()
        baseCssPixelsRef.value = cssPixelsRef.value
        basePosition = positionRef.value
        isDraggingRef.value = true

        document.body.appendChild(overlayEl)
        document.body.setAttribute('dnd-grid-drag', '')
    },
    stop: function onDragStop () {
        stopLayout()
        isDraggingRef.value = false
        slotContainerElRef.value?.style?.removeProperty('--dnd-grid-box-offset-left')
        slotContainerElRef.value?.style?.removeProperty('--dnd-grid-box-offset-top')

        overlayEl.remove()
        document.body.removeAttribute('dnd-grid-drag')
    },
    update: function onDragUpdate ({ offsetX, offsetY }) {
        let offsetPixels = { x: offsetX, y: offsetY, w: 0, h: 0 }
        applyOffsetPixels(basePosition, offsetPixels)
    }
})

const isResizingRef = shallowRef(false)
let resizeMode
const resizeEvents = useDndHandler({
    allow: function allowResize (evt) {
        return isBoxResizableRef.value && canStartResize(evt)
    },
    start: function onResizeStart (_, evt) {
        startLayout()
        resizeMode = evt?.target?.getAttribute?.('dnd-grid-resize') || 'br'
        baseCssPixelsRef.value = cssPixelsRef.value
        basePosition = positionRef.value
        isResizingRef.value = true

        document.body.appendChild(overlayEl)
        document.body.setAttribute('dnd-grid-resize', resizeMode)
    },
    stop: function onResizeStop () {
        stopLayout()
        isResizingRef.value = false
        slotContainerElRef.value?.style?.removeProperty('--dnd-grid-box-offset-width')
        slotContainerElRef.value?.style?.removeProperty('--dnd-grid-box-offset-height')

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

const boxEventsRef = computed(() => {
    return mergeEvents(dragEvents, resizeEvents)
})

function applyOffsetPixels (basePosition, offsetPixels) {
    const slotContainerEl = slotContainerElRef.value
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-left', `${offsetPixels.x}px`)
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-top', `${offsetPixels.y}px`)
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-width', `${offsetPixels.w}px`)
    slotContainerEl?.style?.setProperty('--dnd-grid-box-offset-height', `${offsetPixels.h}px`)

    slotContainerEl?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
    })

    const cellSize = computedCellSizeRef.value
    const halfCellSizeWidth = cellSize.width / 2
    const halfCellSizeHeight = cellSize.height / 2
    const targetPosition = fromPixels({
        x: offsetPixels.x + halfCellSizeWidth, // add half cellsize for better box placement
        y: offsetPixels.y + halfCellSizeHeight,
        w: offsetPixels.w + halfCellSizeWidth,
        h: offsetPixels.h + halfCellSizeHeight
    }, cellSize.width, cellSize.height, cellSize.spacing)

    targetPosition.x = Math.max(0, targetPosition.x + basePosition.x)
    targetPosition.y = Math.max(0, targetPosition.y + basePosition.y)
    targetPosition.w = Math.max(1, targetPosition.w + basePosition.w)
    targetPosition.h = Math.max(1, targetPosition.h + basePosition.h)

    updatePosition(targetPosition)
}

function updatePosition (targetPosition) {
    const position = positionRef.value
    if (
        position.x !== targetPosition.x ||
        position.y !== targetPosition.y ||
        position.w !== targetPosition.w ||
        position.h !== targetPosition.h
    ) {
        updateBox(boxRef.value.id, { position: targetPosition })
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
        v-if="visibleRef"
        ref="boxElRef"
        :class="{
            [$style.box]: true,
            [$style.dragging]: isDraggingRef,
            [$style.resizing]: isResizingRef
        }"
        :style="cssPositionRef"
        v-on="boxEventsRef"
    >
        <div
            v-if="isDraggingRef || isResizingRef"
            :class="$style.placeholderContainer"
        >
            <slot
                name="placeholder"
                v-bind="boxRef"
            >
                <div :class="$style.placeholder" />
            </slot>
        </div>
        <div
            ref="slotContainerElRef"
            :class="$style.slotContainer"
        >
            <slot v-bind="boxRef" />
        </div>
        <div
            v-if="addResizeHandlesRef && isBoxResizableRef"
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
    grid-column: var(--dnd-grid-box-x) / span var(--dnd-grid-box-width);
    grid-row: var(--dnd-grid-box-y) / span var(--dnd-grid-box-height);
    display: grid;
}

.box > * {
    grid-column: 1;
    grid-row: 1;
}
.mode-layout .box {
    user-select: none;
}

.mode-layout .box:not(.mode-layout .mode-grid .box) > :is(.slotContainer, .placeholderContainer) {
    position: absolute;
    left: v-bind('cssPixelsRef.x');
    top: v-bind('cssPixelsRef.y');
    width: v-bind('cssPixelsRef.w');
    height: v-bind('cssPixelsRef.h');
}

.mode-layout .box:is(.dragging, .resizing):not(.mode-layout .mode-grid .box)  > .slotContainer {
    left: calc(v-bind('baseCssPixelsRef.x') + var(--dnd-grid-box-offset-left, 0px));
    top: calc(v-bind('baseCssPixelsRef.y') + var(--dnd-grid-box-offset-top, 0px));
    width: calc(v-bind('baseCssPixelsRef.w') + var(--dnd-grid-box-offset-width, 0px));
    height: calc(v-bind('baseCssPixelsRef.h') + var(--dnd-grid-box-offset-height, 0px));
}
.placeholder {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background: var(--dnd-grid-placeholder-background, #F002);
    border: var(--dnd-grid-placeholder-border, none);
}

.mode-layout .box:is(.dragging, .resizing):not(.mode-layout .mode-grid .box) > .slotContainer {
    z-index: 9999;
    opacity: 0.6;
}

.mode-layout .box:not(.dragging, .resizing):not(.mode-layout .mode-grid .box) > .slotContainer,
.placeholderContainer {
    transition-property: left, top, width, height;
    transition-duration: var(--dnd-grid-transition-duration, 0.1s);
    transition-timing-function: var(--dnd-grid-transition-timing-function, ease-out);
}

.slotContainer {
    z-index: 1;
    overflow: v-bind('overflow');
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
