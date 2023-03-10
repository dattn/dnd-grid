<script>
export default {
    inheritAttrs: false
}

let NEXT_DND_GRID_ID = 1
</script>

<script setup>
import { provide, readonly, useCssModule, watch, onMounted, onBeforeUnmount } from 'vue'
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

const { layout: externalLayout, disabled, isDraggable, isResizable, addResizeHandles } = $(props)

const $style = useCssModule()

const containerEl = $ref()
let computedCellSize = $ref()
let mode = $ref('grid')
let layout = $ref(externalLayout)

provide(ContainerSymbol, $$({
    layout: readonly(layout),
    mode: readonly(mode),
    disabled: readonly(disabled),
    isResizable: readonly(isResizable),
    isDraggable: readonly(isDraggable),
    computedCellSize: readonly(computedCellSize),
    startLayout,
    stopLayout,
    getBox,
    updateBox,
    canStartDrag,
    canStartResize,
    addResizeHandles
}))

watch($$(externalLayout), newLayout => {
    layout = newLayout
})

const layoutOptions = $computed(() => {
    return {
        bubbleUp: props.bubbleUp
    }
})

const dragSelectors = $computed(() => {
    return getSelectorsFromProp(props.dragSelector)
})

const resizeSelectors = $computed(() => {
    return getSelectorsFromProp(props.resizeSelector)
})

const cursorStyleContent = $computed(() => {
    const styleContent = []

    styleContent.push(
        ...[
            ['', 'cursor: var(--dnd-resize-cursor-nwse, nwse-resize);'],
            [':where([dnd-grid-resize=t-], [dnd-grid-resize=b-])', 'cursor: var(--dnd-resize-cursor-ns, ns-resize);'],
            [':where([dnd-grid-resize=-r], [dnd-grid-resize=-l])', 'cursor: var(--dnd-resize-cursor-ew, ew-resize);'],
            [':where([dnd-grid-resize=tl], [dnd-grid-resize=br])', 'cursor: var(--dnd-resize-cursor-nwse, nwse-resize);'],
            [':where([dnd-grid-resize=tr], [dnd-grid-resize=bl])', 'cursor: var(--dnd-resize-cursor-nesw, nesw-resize);']
        ].map(([ selector, rules]) => {
            const selectors = getSelectorsFromProp(props.resizeSelector, selector)
            return `
                .${$style.container}[dnd-grid-id="${DND_GRID_ID}"] :not(.${$style.container}) ${selectors.join(', ')} {
                    ${rules}
                }
            `
        }),
        ...[
            ['', 'cursor: var(--dnd-drag-cursor, move);']
        ].map(([ selector, rules]) => {
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
watch($$(cursorStyleContent), content => {
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
    return _getBox(layout, id, layoutOptions)
}

function updateBox (id, data) {
    return layout = _updateBox(externalLayout, id, data, layoutOptions)
}

function toCssSize (value) {
    if (value == undefined) return
    return isNaN(value) ? value : `${value}px`
}

function updateComputedCellSize () {
    if (containerEl) {
        const style = getComputedStyle(containerEl)
        const width = parseFloat(style.gridTemplateColumns)
        const height = parseFloat(style.gridTemplateRows)
        const spacing = parseFloat(style.gap)

        computedCellSize = { width, height, spacing }
    }
    return computedCellSize
}

function startLayout () {
    updateComputedCellSize()
    mode = 'layout'
}

function stopLayout () {
    emit('update:layout', layout)
    mode = 'grid'
}

function canStartDrag (evt) {
    return evt.target && dragSelectors.find(selector => evt.target.matches(selector))
}

function canStartResize (evt) {
    return evt.target && resizeSelectors.find(selector => evt.target.matches(selector))
}

function getSelectorsFromProp (prop, additionalSelector) {
    let selectors = [
        (prop.include || '*') + (additionalSelector || ''),
        (prop.include || '*') + (additionalSelector || '') + ' *'
    ]
    if (prop.exclude) {
        selectors = selectors.map(selector => `${selector}:not(${prop.exclude})`)
    }

    return selectors
}
</script>

<template>
    <div
        ref="containerEl"
        :dnd-grid-id="DND_GRID_ID"
        :class="{
            [$style.container]: true,
            [$style['mode-' + mode]]: true,
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
