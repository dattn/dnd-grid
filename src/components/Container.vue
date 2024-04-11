<script>
export default {
    inheritAttrs: false
}

let NEXT_DND_GRID_ID = 1
</script>

<script setup>
import { provide, readonly, useCssModule, watch, onMounted, onBeforeUnmount, toRef, shallowRef, computed } from 'vue'
import { ContainerSymbol } from '../symbols.js'
import { getBox as _getBox, updateBox as _updateBox } from '../LayoutTools.js'

const props = defineProps({
    layout: {
        type: Array,
        default: () => []
    },

    bubbleUp: {
        type: [Boolean, String],
        default: false
    },

    disabled: {
        type: Boolean,
        default: false
    },

    isResizable: {
        type: Boolean,
        default: true,
    },

    isDraggable: {
        type: Boolean,
        default: true
    },

    dragSelector: {
        type: Object,
        default: () => ({
            include: '[dnd-grid-drag]',
            exclude: ':is(input, button, select, a[href])'
        })
    },

    resizeSelector: {
        type: Object,
        default: () => ({
            include: '[dnd-grid-resize]',
            exclude: ':is(input, button, select, a[href])'
        })
    },

    addResizeHandles: {
        type: Boolean,
        default: true
    },

    // styling (mapped to css props)
    cellWidth: {
        type: [Number, String],
        default: null
    },

    cellMaxWidth: {
        type: [Number, String],
        default: null
    },

    cellHeight: {
        type: [Number, String],
        default: null
    },

    cellMaxHeight: {
        type: [Number, String],
        default: null
    },

    cellSpacing: {
        type: [Number, String],
        default: null
    },

    resizeHandlerSize: {
        type: [Number, String],
        default: null
    },

    resizeHandlerOffset: {
        type: [Number, String],
        default: null
    },

    placeholderBackground: {
        type: String,
        default: null
    },

    placeholderBorder: {
        type: String,
        default: null
    },

    transitionTimingFunction: {
        type: String,
        default: null
    },

    transitionDuration: {
        type: String,
        default: null
    }
})

const DND_GRID_ID = NEXT_DND_GRID_ID++

const emit = defineEmits(['update:layout'])

const $style = useCssModule()

const containerElRef = shallowRef()
const computedCellSizeRef = shallowRef()
const modeRef = shallowRef('grid')
const layoutRef = shallowRef(props.layout)

provide(ContainerSymbol, {
    layout: readonly(layoutRef),
    mode: readonly(modeRef),
    disabled: toRef(() => props.disabled),
    isResizable: toRef(() => props.isResizable),
    isDraggable: toRef(() => props.isDraggable),
    computedCellSize: readonly(computedCellSizeRef),
    startLayout,
    stopLayout,
    getBox,
    updateBox,
    canStartDrag,
    canStartResize,
    addResizeHandles: toRef(() => props.addResizeHandles)
})

watch(() => props.layout, newLayout => {
    layoutRef.value = newLayout
})

const layoutOptionsRef = computed(() => {
    return {
        bubbleUp: props.bubbleUp
    }
})

const dragSelectorsRef = computed(() => {
    return getSelectorsFromProp(props.dragSelector)
})

const resizeSelectorsRef = computed(() => {
    return getSelectorsFromProp(props.resizeSelector)
})

const cursorStyleContentRef = computed(() => {
    if (props.disabled) {
        return ''
    }

    const styleContent = []

    styleContent.push(
        ...[
            ['', 'cursor: var(--dnd-resize-cursor-nwse, nwse-resize);'],
            [':where([dnd-grid-resize=t-], [dnd-grid-resize=b-])', 'cursor: var(--dnd-resize-cursor-ns, ns-resize);'],
            [':where([dnd-grid-resize=-r], [dnd-grid-resize=-l])', 'cursor: var(--dnd-resize-cursor-ew, ew-resize);'],
            [':where([dnd-grid-resize=tl], [dnd-grid-resize=br])', 'cursor: var(--dnd-resize-cursor-nwse, nwse-resize);'],
            [':where([dnd-grid-resize=tr], [dnd-grid-resize=bl])', 'cursor: var(--dnd-resize-cursor-nesw, nesw-resize);']
        ].map(([selector, rules]) => {
            const selectors = getSelectorsFromProp(props.resizeSelector, selector)
            return `
                .${$style.container}[dnd-grid-id="${DND_GRID_ID}"] :not(.${$style.container}) ${selectors.join(', ')} {
                    ${rules}
                }
            `
        }),
        ...[
            ['', 'cursor: var(--dnd-drag-cursor, move);']
        ].map(([selector, rules]) => {
            const selectors = getSelectorsFromProp(props.dragSelector, selector)
            return `
                .${$style.container}[dnd-grid-id="${DND_GRID_ID}"] :not(.${$style.container}) ${selectors.join(', ')} {
                    ${rules}
                }
            `
        })
    )

    return styleContent.join('\n')
})

const cursorStyleSheet = new CSSStyleSheet()
watch(cursorStyleContentRef, content => {
    cursorStyleSheet.replaceSync(content)
}, {
    immediate: true
})

onMounted(() => {
    document.adoptedStyleSheets = [ ...document.adoptedStyleSheets, cursorStyleSheet ]
})

onBeforeUnmount(() => {
    const index = document.adoptedStyleSheets.indexOf(cursorStyleSheet)
    if (index > -1) {
        document.adoptedStyleSheets = [
            ...document.adoptedStyleSheets.slice(0, index),
            ...document.adoptedStyleSheets.slice(index+1),
        ]
    }
})

function getBox (id) {
    return _getBox(layoutRef.value, id, layoutOptionsRef.value)
}

function updateBox (id, data) {
    return layoutRef.value = _updateBox(props.layout, id, data, layoutOptionsRef.value)
}

function toCssSize (value) {
    if (value == undefined) return
    return isNaN(value) ? value : `${value}px`
}

function updateComputedCellSize () {
    if (containerElRef.value) {
        const style = getComputedStyle(containerElRef.value)
        const width = parseFloat(style.gridTemplateColumns)
        const height = parseFloat(style.gridTemplateRows)
        const spacing = parseFloat(style.gap)

        computedCellSizeRef.value = { width, height, spacing }
    }
    return computedCellSizeRef.value
}

function startLayout () {
    updateComputedCellSize()
    modeRef.value = 'layout'
}

function stopLayout () {
    emit('update:layout', layoutRef.value)
    modeRef.value = 'grid'
}

function canStartDrag (evt) {
    return evt.target && dragSelectorsRef.value.find(selector => evt.target.matches(selector))
}

function canStartResize (evt) {
    return evt.target && resizeSelectorsRef.value.find(selector => evt.target.matches(selector))
}

function getSelectorsFromProp (prop, additionalSelector) {
    let selectors = [
        (prop.include || '*') + (additionalSelector || ''),
        (prop.include || '*') + (additionalSelector || '') + ' *'
    ]
    if (prop.exclude) {
        selectors = selectors.map(selector => `${selector}:not(${prop.exclude}, ${prop.exclude} *)`)
    }

    return selectors
}
</script>

<template>
    <div
        ref="containerElRef"
        :dnd-grid-id="DND_GRID_ID"
        :class="{
            [$style.container]: true,
            [$style['mode-' + modeRef]]: true,
        }"
        :style="{
            '--dnd-grid-cell-width': toCssSize(props.cellWidth),
            '--dnd-grid-cell-max-width': toCssSize(props.cellMaxWidth),
            '--dnd-grid-cell-height': toCssSize(props.cellHeight),
            '--dnd-grid-cell-max-height': toCssSize(props.cellMaxHeight),
            '--dnd-grid-cell-spacing': toCssSize(props.cellSpacing),
            '--dnd-grid-resize-handler-size': toCssSize(props.resizeHandlerSize),
            '--dnd-grid-resize-handler-offset': toCssSize(props.resizeHandlerOffset),
            '--dnd-grid-placeholder-background': props.placeholderBackground,
            '--dnd-grid-placeholder-border': props.placeholderBorder,
            '--dnd-grid-transition-timing-function': props.transitionTimingFunction,
            '--dnd-grid-transition-duration': props.transitionDuration,
        }"
    >
        <slot />
    </div>
</template>

<style module>
:where(.container) {
    all: unset;
}

.container {
    display: grid;
    position: relative;
    grid-auto-columns: minmax(
        var(--dnd-grid-cell-width, 8em),
        var(--dnd-grid-cell-max-width, 0)
    );
    grid-auto-rows: minmax(
        var(--dnd-grid-cell-height, 8em),
        var(--dnd-grid-cell-max-height, 0)
    );
    gap: var(--dnd-grid-cell-spacing, 0.5em);
    min-width: min-content;
    min-height: min-content;
}

.mode-grid {

}
.mode-layout {

}
</style>
