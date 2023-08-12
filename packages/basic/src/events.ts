type ListenerHandler = (...args: any[]) => void 
type Listener = {
  handler: ListenerHandler, 
  context: unknown, 
  once: boolean
}

export class EventEmitter<T extends string> {
  public events: Map<T, Listener[]> = new Map()

  eventNames () {
    return Object.entries(this).map(([event]) => event)
  }

  listeners (event: T) {
    return this.events.get(event) ?? []
  }

  listenerCount (event: T) {
    const listeners = this.events.get(event) ?? []
    return listeners.length
  }

  emit (event: T, ...args: unknown[]) {
    if (this.events.has(event)) {
      const listeners = this.events.get(event)?.slice()

      if (listeners) {

        for (const listener of listeners) {
          if (listener.once) {
            this.removeListener(event, listener.handler, undefined, true)
          }

          Reflect.apply(listener.handler, listener.context, args)
        }
      }
      
      return true
    }

    return false
  }

  on (event: T, handler: ListenerHandler, context?: unknown) { 
    return this.addListener(event, handler, context, false)
  }

  once (event: T, handler: ListenerHandler, context?: unknown) { 
    return this.addListener(event, handler, context, true)
  }

  off (event: T, handler?: ListenerHandler, context?: unknown) {
    return this.removeListener(event, handler, context)
  }

  addListener (
    event: T, 
    handler: ListenerHandler, 
    context: unknown, 
    once: boolean
  ) {
    if (typeof handler !== 'function') {
      throw new TypeError('The listener handler must be a function.')
    }
  
    const listener: Listener = {
      context,
      handler,
      once,
    }
  
    if (this.events.has(event)) {
      this.events.get(event)?.push(listener)
    } else {
      this.events.set(event, [listener])
    }
  
    return this
  }

  removeListener (event: T, handler?: ListenerHandler, context?: unknown, once?: boolean) {
    if (this.events.has(event)) {
      if (handler === undefined) {
        this.events.delete(event)
      } else {
        const listeners = this.events.get(event)
  
        if (listeners) {
          for (const listener of listeners) {
            const index = listeners.findIndex((findListener: Listener) => {
              return (
                listener.handler === handler &&
                listener.context === context &&
                listener.once === once
              )
            })
            
            if (index > -1) {
              listeners.splice(index, 1)
            }
          }
  
          if (listeners.length === 0) {
            this.events.delete(event)
          }
        }
      } 
    } 

    return this
  }

  removeAllListeners (event?: T) {
    if (event) {
      this.removeListener(event)
    } else {
      this.events.clear()
    }
  
    return this
  }
}

