import { onScopeDispose } from 'vue'

export default function useMouseHandler (callbacks = {}) {
    let isActive = false
    let startX
    let startY
    let offsetX
    let offsetY

    function doUpdate (type, evt) {
        if (evt) {
            offsetX = evt.clientX - startX
            offsetY = evt.clientY - startY
        }

        callbacks[type]?.({ startX, startY, offsetX, offsetY }, evt)
    }

    function onStart (evt) {
        if (isActive) return
        isActive = true

        startX = evt.clientX
        startY = evt.clientY

        window.addEventListener('mouseup', onStop, { capture: true, passive: true, once: true })
        window.addEventListener('mousemove', onMove, { capture: true, passive: true })

        doUpdate('start', evt)
    }

    function onStop (evt) {
        if (!isActive) return
        isActive = false
        window.removeEventListener('mouseup', onStop, { capture: true, passive: true, once: true })
        window.removeEventListener('mousemove', onMove, { capture: true, passive: true })

        doUpdate('stop', evt)
    }

    function onMove (evt) {
        doUpdate('update', evt)
    }

    onScopeDispose(() => onStop())

    return onStart
}
