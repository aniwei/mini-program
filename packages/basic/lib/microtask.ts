import invariant from 'ts-invariant'
import { isNative } from './is'
import { VoidCallback } from '@catalyze/types'

//// => MicroTaskQueue
export type MicroTask<T = unknown> = {
  context: T,
  handler: VoidCallback,
  resolve: (value: unknown) => void
}

export class MicroTaskQueue {
  static isUsingMicroTask = false

  // => microTaskExec
  static _exec: VoidCallback | null = null
  static get exec () {
    invariant(MicroTaskQueue._exec !== null)
    return MicroTaskQueue._exec
  }

  static q = new MicroTaskQueue()

  protected queue: MicroTask[] = []
  protected pending: boolean = false

  enqueue <T = unknown> (tick: VoidCallback, resolve: (value: unknown) => void, context: T) {
    this.queue.push({
      handler: () => resolve(tick()),
      context,
      resolve
    })

    if (!this.pending) {
      this.pending = true
      MicroTaskQueue.exec()
    }
  }

  flush () {
    this.pending = false
    let q = this.queue.shift() ?? null

    while (q !== null) {
      Reflect.apply(q.handler, q.context, [])
      q = this.queue.shift() ?? null
    }
  }
}

//// => nextTick
export const nextTick = (tick: VoidCallback, context?: unknown) => {
  return new Promise((resolve) => MicroTaskQueue.q.enqueue(tick, resolve, context))
}

const flush = () => MicroTaskQueue.q.flush()

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const promise = Promise.resolve()
  MicroTaskQueue._exec = () => promise.then(flush)
  MicroTaskQueue.isUsingMicroTask = true
} else {
  MicroTaskQueue._exec = () => setTimeout(flush, 0)
}
