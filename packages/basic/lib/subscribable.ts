import { EventEmitter } from './events'

export type SubscribeHandle = (...args: any[]) => Promise<unknown> | unknown
export type Subscriber<T extends SubscribeHandle> = {
  handler: T ,
  context: unknown, 
  once: boolean
}

export class Subscribable<E extends string = string, T extends SubscribeHandle = SubscribeHandle> extends EventEmitter<E> {
  private subscribers: Subscriber<T>[] = []

  public get size () {
    return this.subscribers.length
  }

  /**
   * 订阅消息
   * @param {T} handler 
   * @param {unknown} context 
   * @param {boolean} once 
   */
  subscribe (
    handler: T, 
    context?: unknown, 
    once: boolean = false
  ) {
    if (typeof handler !== 'function') {
      throw new TypeError('The listener handler must be a function.')
    }
  
    const listener: Subscriber<T> = {
      handler,
      context,
      once
    }
  
    this.subscribers.push(listener)    
  }

  // once ( 
  //   handler: T, 
  //   context?: unknown,
  // ) {
  //   this.subscribe(handler, context, true)
  // }

  /**
   * 取消订阅
   * @param {T} handler 
   * @param {unknown} context 
   */
  unsubscribe (
    handler?: T, 
    context?: unknown
  ) {
  
    for (const listener of this.subscribers) {
      const index = this.subscribers.findIndex((findListener: Subscriber<T>) => {
        return (
          listener.handler === handler &&
          listener.context === context
        )
      })
      
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  /**
   * 发布消息
   * @param {unknown[]} rests 
   * @returns 
   */
  async publish <R = unknown> (...rests: unknown[]) {
    for (const listener of this.subscribers) {
      try {
        if (listener.once) {
          this.unsubscribe(listener.handler, listener.context)
        }

        const result = Reflect.apply(listener.handler, listener.context, rests) ?? null
        return Promise.resolve(result).then(result => result as R)

      } catch (error: any) {
        throw error
      }
    }
  }

  // 清除订阅
  clear () {
    this.subscribers = []
  }
}

