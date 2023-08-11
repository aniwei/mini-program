import invariant from 'ts-invariant'
import { 
  MessageOwner, 
  PodStatus, 
  WorkPort, 
} from '@catalyze/basic'
import { ProxyCompile } from './proxy'
import { WxWCC } from '../wx/wcc'
import { WxWCSC } from '../wx/wcsc'

type MessagePayload = {
  parameters: string[],
}

class WorkerCompilePod extends ProxyCompile {
  
  // => wcc
  protected _wcc: WxWCC | null = null
  protected get wcc () {
    invariant(this._wcc !== null)
    return this._wcc
  }
  protected set wcc (wcc: WxWCC) {
    this._wcc = wcc
  }

  // => wcsc
  protected _wcsc: WxWCSC | null = null
  protected get wcsc () {
    invariant(this._wcsc !== null)
    return this._wcsc
  }
  protected set wcsc (wcsc: WxWCSC) {
    this._wcsc = wcsc
  }

  constructor () {
    super()

    this.command('message::init', async (message: MessageOwner) => {
      const payload = message.payload as unknown as MessagePayload
      const { parameters } = payload
      const root = parameters[0]
      
      this.root = root
      this.wcc = new WxWCC(this.root)  
      this.wcsc = new WxWCSC(this.root)

      this.status |= PodStatus.Inited
    })

    this.command('message::compile', async (message: MessageOwner) => {
      this.busy()

      const payload = message.payload as unknown as MessagePayload
      const { parameters } = payload

      return this.runTask<string>(...parameters).then((result) => {
        return {
          command: 'message::callback',
          payload: result as string
        }
      }).then((result) => {
        return result
      }).finally(() => this.idle())
    })
  }

  runTask<T> (...rests: unknown[]): Promise<T>
  runTask<T> (parameters: string[], type: 'XML' | 'CSS' = 'XML'): Promise<T> {
    switch (type) {
      case 'CSS':
        return this.wcsc.compile(parameters) as Promise<T>

      case 'XML':
        return this.wcc.compile(parameters) as Promise<T>
    }
  }

  establish () {
    return this.send({ command: 'message::connected' }).then(() => this.status |= PodStatus.Connected)
  }
}

global.addEventListener('message', async (event: MessageEvent<{ type: 'connection', port: MessagePort }>) => {
  if (event.data.type === 'connection') {
    WorkerCompilePod.create<WorkerCompilePod>(new WorkPort(event.data.port)).establish()
  }
})