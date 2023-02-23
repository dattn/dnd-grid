import { onScopeDispose } from 'vue'

export default function useMouseHandler (callbacks = {}) {
    let hasStarted = false
    let isActive = false
    let isTouch = false
    let startEvent
    let startX
    let startY
    let offsetX
    let offsetY

    function doUpdate (type, evt) {
        if (evt) {
            offsetX = (isTouch ? evt.changedTouches[0].pageX : evt.pageX) - startX
            offsetY = (isTouch ? evt.changedTouches[0].pageY : evt.pageY) - startY
        }

        callbacks[type]?.({ startX, startY, offsetX, offsetY }, evt)
    }

    function onStart (evt) {
        if (hasStarted || !callbacks?.['allow']?.(evt)) return
        evt.stopPropagation()

        hasStarted = true
        isTouch = evt.type === 'touchstart'
        startEvent = evt
        startX = isTouch ? evt.changedTouches[0].pageX : evt.pageX
        startY = isTouch ? evt.changedTouches[0].pageY : evt.pageY

        if (isTouch) {
            window.addEventListener('touchcancel', onCancel, { capture: true, passive: true, once: true })
            window.addEventListener('touchend', onStop, { capture: true, passive: true, once: true })
            window.addEventListener('touchmove', onMove, { capture: true, passive: true })
        } else {
            window.addEventListener('mouseup', onStop, { capture: true, passive: true, once: true })
            window.addEventListener('mousemove', onMove, { capture: true, passive: true })
        }
    }

    function onStop (evt) {
        evt.stopPropagation()
        evt.preventDefault()

        if (isTouch) {
            window.removeEventListener('touchcancel', onCancel, { capture: true, passive: true, once: true })
            window.removeEventListener('touchend', onStop, { capture: true, passive: true, once: true })
            window.removeEventListener('touchmove', onMove, { capture: true, passive: true })
        } else {
            window.removeEventListener('mouseup', onStop, { capture: true, passive: true, once: true })
            window.removeEventListener('mousemove', onMove, { capture: true, passive: true })
        }

        if (isActive) {
            doUpdate('stop', evt)
            hasStarted = false
            isActive = false
            startEvent = undefined
        }
    }

    function onCancel (evt) {
        evt?.stopPropagation()
        evt?.preventDefault()

        return onStop(startEvent)
    }

    function onMove (evt) {
        evt.stopPropagation()
        evt.preventDefault()

        if (!isActive) {
            isActive = true
            doUpdate('start', startEvent)
        }

        doUpdate('update', evt)
    }

    onScopeDispose(() => onCancel())

    return {
        touchstart: onStart,
        mousedown: onStart
    }
}
