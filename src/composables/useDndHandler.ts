import { onScopeDispose } from 'vue'

type MouseCallbackArg = {
    startX: number,
    startY: number,
    offsetX: number,
    offsetY: number,
}

export type EventHandlerCallback = (movement: MouseCallbackArg, evt: MouseEvent | TouchEvent | undefined) => void

export type Callbacks = {
    allow?: (evt: MouseEvent | TouchEvent) => boolean,
    start?: (movement: MouseCallbackArg, evt: MouseEvent | TouchEvent) => void,
    stop?: (movement: MouseCallbackArg, evt: MouseEvent | TouchEvent | undefined) => void,
    update?: (movement: MouseCallbackArg, evt: MouseEvent | TouchEvent) => void,
}


export default function useMouseHandler (callbacks: Callbacks = {}) {
    let hasStarted = false
    let isActive = false
    let isTouch = false
    let startEvent: MouseEvent | TouchEvent | undefined
    let startX: number | undefined
    let startY: number | undefined
    let offsetX: number | undefined
    let offsetY: number | undefined

    function doUpdate (type: "start" | "stop" | "update", evt: MouseEvent | TouchEvent | undefined) {
        if (evt) {
            offsetX = (isTouch ? (evt as TouchEvent).changedTouches[0].pageX : (evt as MouseEvent).pageX) - startX!
            offsetY = (isTouch ? (evt as TouchEvent).changedTouches[0].pageY : (evt as MouseEvent).pageY) - startY!
        }

        callbacks[type]?.({ startX: startX!, startY: startY!, offsetX: offsetX!, offsetY: offsetY! }, evt)
    }

    function onStart (evt: MouseEvent | TouchEvent) {
        if (evt.defaultPrevented || hasStarted || !callbacks?.['allow']?.(evt)) return
        evt.stopPropagation()
        evt.preventDefault()

        hasStarted = true
        isTouch = evt.type === 'touchstart'
        startEvent = evt
        startX = isTouch ? (evt as TouchEvent).changedTouches[0].pageX : (evt as MouseEvent).pageX
        startY = isTouch ? (evt as TouchEvent).changedTouches[0].pageY : (evt as MouseEvent).pageY

        if (isTouch) {
            window.addEventListener('touchcancel', onCancel, { once: true })
            window.addEventListener('touchend', onStop, { once: true })
            window.addEventListener('touchmove', onMove, { passive: false })
        } else {
            window.addEventListener('mouseup', onStop, { once: true })
            window.addEventListener('mousemove', onMove, { passive: false })
        }
    }

    function onStop (evt: MouseEvent | TouchEvent | undefined) {
        evt?.stopPropagation()
        evt?.preventDefault()

        if (isTouch) {
            window.removeEventListener('touchcancel', onCancel, { once: true } as EventListenerOptions)
            window.removeEventListener('touchend', onStop, { once: true } as EventListenerOptions)
            window.removeEventListener('touchmove', onMove, { passive: false } as EventListenerOptions)
        } else {
            window.removeEventListener('mouseup', onStop, { once: true } as EventListenerOptions)
            window.removeEventListener('mousemove', onMove, { passive: false } as EventListenerOptions)
        }

        if (isActive) {
            doUpdate('stop', evt)
        }

        hasStarted = false
        isActive = false
        startEvent = undefined
    }

    function onCancel (evt?: MouseEvent | TouchEvent | undefined) {
        evt?.stopPropagation()
        evt?.preventDefault()

        return onStop(startEvent)
    }

    function onMove (evt: MouseEvent | TouchEvent) {
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
