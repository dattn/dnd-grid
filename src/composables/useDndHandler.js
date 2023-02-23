import { onScopeDispose } from 'vue'

export default function useMouseHandler (callbacks = {}) {
    let isActive = false
    let startEvent
    let startX
    let startY
    let offsetX
    let offsetY

    function doUpdate (type, evt) {
        if (evt) {
            offsetX = evt.pageX - startX
            offsetY = evt.pageY - startY
        }

        callbacks[type]?.({ startX, startY, offsetX, offsetY }, evt)
    }

    function onStart (evt) {
        if (isActive || !callbacks?.['allow']?.(evt)) return
        evt.stopPropagation()

        startEvent = evt
        startX = evt.pageX
        startY = evt.pageY

        window.addEventListener('mouseup', onStop, { capture: true, passive: true, once: true })
        window.addEventListener('mousemove', onMove, { capture: true, passive: true })
    }

    function onStop (evt) {
        window.removeEventListener('mouseup', onStop, { capture: true, passive: true, once: true })
        window.removeEventListener('mousemove', onMove, { capture: true, passive: true })

        if (isActive) {
            isActive = false
            startEvent = undefined
            doUpdate('stop', evt)
        }
    }

    function onMove (evt) {
        if (!isActive) {
            isActive = true
            doUpdate('start', startEvent)
        }

        doUpdate('update', evt)
    }

    onScopeDispose(() => onStop())

    return {
        mousedown: onStart
    }
}
