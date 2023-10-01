import URL from 'url'
import vm from 'vm'
import WorkerThread from 'worker_threads'

const WORKER_SYMBOL = Symbol.for('worker')
const kBaseURL = URL.pathToFileURL(process.cwd() + '/')

//// => DataURL
// DataURL 解析
class DataURL {
	static evaluate (url: string, name: string) {
		const dataURL = new DataURL(url, name)
		dataURL.evaluate()
		return dataURL
	}

	private url: string
	private name: string

	private get filename () {
		return `worker.<+(${this.name || 'data:'})>`
	}

	constructor (url: string, name: string) {
		this.url = url
		this.name = name
	}

	parse () {
		const [matched, type, encoding, data] = this.url.match(/^data: *([^;,]*)(?: *; *([^,]*))? *,(.*)$/) || []
	
		if (!matched) {
			throw Error('Invalid Data URL.')
		}

		if (encoding) {
			if (encoding.toLowerCase() === 'base64') {
				return {
					type,
					data: Buffer.from(data, 'base64').toString()
				}
			} else {
				throw Error('Unknown Data URL encoding "' + encoding + '"')
			}
		}

		return { type, data }
	}

	evaluate () {
		const { data } = this.parse()
		return vm.runInThisContext(data, {
			filename: this.filename
		})
	}
}

//// => ErrorEvent
// 错误事件
class ErrorEvent extends Event {
	public error: Error

	constructor (error: Error) {
		super('error')
		this.error = error
	}
}


//// => Thread
type EventHandle = () => void

// => 主线程
const mainThread = () => {
	interface Worker {
		[WORKER_SYMBOL]: Worker
	}

	//// => Worker
	class Worker extends EventTarget implements Worker {
		// => onmessage
		public _onmessage: EventHandle | null = null
		public get onmessage () {
			return this._onmessage
		}
		public set onmessage (onmessage: EventHandle | null) {
			if (this._onmessage !== onmessage) {
				if (this._onmessage !== null) {
					this.removeEventListener('message', this._onmessage)
				}

				if (onmessage !== null) {
					this.addEventListener('message', onmessage)
				}

				this._onmessage = onmessage
			}
		}

		// => onmessage
		public _onclose: EventHandle | null = null
		public get onclose () {
			return this._onclose
		}
		public set onclose (onclose: EventHandle | null) {
			if (this._onclose !== onclose) {
				if (this._onclose !== null) {
					this.removeEventListener('close', this._onclose)
				}

				if (onclose !== null) {
					this.addEventListener('close', onclose)
				}

				this._onclose = onclose
			}
		}

		// => onmessageerror
		public _onmessageerror: EventHandle | null = null
		public get onmessageerror () {
			return this._onmessageerror
		}
		public set onmessageerror (onmessageerror: EventHandle | null) {
			if (this._onmessageerror !== onmessageerror) {
				if (this._onmessageerror !== null) {
					this.removeEventListener('error', this._onmessageerror)
				}

				if (onmessageerror !== null) {
					this.addEventListener('error', onmessageerror)
				}

				this._onmessageerror = onmessageerror
			}
		}

		constructor (url: string, options?: { name: string, type: 'module' | 'classic' }) {
			super()
			
      const { name, type } = options || {}
      const mode = /^data:/.test(url) ? url : URL.fileURLToPath(new URL.URL(url, kBaseURL))

			const worker = new WorkerThread.Worker(__filename, { workerData: { mode, name, type } })

			worker.on('message', data => this.dispatchEvent(new MessageEvent('message', { data })))
			worker.on('error', error => this.dispatchEvent(new Event('error', )))
			worker.on('exit', () => this.dispatchEvent(new Event('close')))

			Reflect.defineProperty(this, WORKER_SYMBOL, { value: worker })
		}

		postMessage (data: unknown, transferList?: ReadonlyArray<WorkerThread.TransferListItem>) {
			this[WORKER_SYMBOL].postMessage(data, transferList)
		}

		terminate () {
			this[WORKER_SYMBOL].terminate()
		}
	}

	
	return Worker
}

//// => workerThread
// 工作线程
const workerThread = () => {
	const { mode, name, type } = WorkerThread.workerData
	let queue: Event[] | null = []
	const self = typeof global.self !== 'undefined' ? global.self : global

	// 执行队列
	const flush = () => {
		const buffered = queue ?? []
		queue = null
		for (const event of buffered) {
			self.dispatchEvent(event)
		}
	}
	
  WorkerThread.parentPort?.on('message', (data: unknown) => {
		const event = new MessageEvent('message', { data })
		if (queue === null) {
			self.dispatchEvent(event)
		} else {
			queue.push(event)
		}
	})
	
	WorkerThread.parentPort?.on('error', (error: any) => self.dispatchEvent(new ErrorEvent(error)))

	class WorkerGlobalScope extends EventTarget {
		postMessage (data: unknown, transferList: WorkerThread.TransferListItem[]) {
			WorkerThread.parentPort?.postMessage(data, transferList)
		}

		close () {
			process.exit()
		}
	}

	let prototype = Object.getPrototypeOf(global)
	delete prototype.constructor
	
	Object.defineProperties(WorkerGlobalScope.prototype, prototype)
	prototype = Object.setPrototypeOf(global, new WorkerGlobalScope())

	;[
		'postMessage', 
		'addEventListener', 
		'removeEventListener', 
		'dispatchEvent'
	].forEach(key => prototype[key] = prototype[key].bind(global))
	
	Reflect.defineProperty(global, 'name', { value: name })
	Reflect.defineProperty(global, 'self', { value: global })
	
	const isDataURL = /^data:/.test(mode)
	if (type === 'module') {
		import(mode).catch((error: any) => {
			if (isDataURL && error.message === 'Not supported') {
				console.warn('Worker(): Importing data: URLs requires Node 12.10+. Falling back to classic worker.')
				return DataURL.evaluate(mode, name)
			}

			throw error
		}).then(flush)
	} else {
		try {
			/^data:/.test(mode) ? DataURL.evaluate(mode, name) : require(mode)
		} catch (error: any) {
			throw error
		}
		
		Promise.resolve().then(flush)
	}
}

export default WorkerThread.isMainThread ? mainThread() : workerThread()