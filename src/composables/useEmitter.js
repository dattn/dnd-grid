import { onScopeDispose, nextTick } from 'vue'
import mitt from 'mitt'

export default function useEmitter () {
    const listeners = new Map()
    const emitter = mitt(listeners)

    onScopeDispose(() => {
        nextTick(() => { // postbone to allow events to be triggered on dispose
            listeners.clear()
        })
    })

    return emitter
}
