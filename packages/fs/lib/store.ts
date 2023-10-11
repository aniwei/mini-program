import { invariant } from 'ts-invariant'
import { EventEmitter, nextTick } from '@catalyzed/basic'
import { getIndexedDB } from './indexeddb'


//// => StoreTransition
export type TransactionHandle<T = unknown> = (transaction: StoreTransaction) => Promise<T>

export  class StoreTransaction {
  public transaction: IDBTransaction
  public store: IDBObjectStore

  constructor (transation: IDBTransaction, store: IDBObjectStore) {
    this.transaction = transation
    this.store = store
  }

  get (query: IDBValidKey) {
    return new Promise((resolve, reject) => {
      const request = this.store.get(query)
      request.onerror = reject
      request.onsuccess = (event: Event) => resolve(event.target)
    })
  }

  put (key: string, value: Buffer, overwrite: boolean = false) {
    return new Promise((resolve, reject) => {
      const request = overwrite 
        ? this.store.put(value, key) 
        : this.store.add(value, key)

      request.onerror = reject
      request.onsuccess = () => resolve(true)
    })
  }

  delete (key: string) {
    return new Promise((resolve, reject) => {
      const request = this.store.delete(key)
      request.onerror = reject
      request.onsuccess = () => resolve(true)
    })
  }

  public commit(): Promise<void> {
		return new Promise(resolve => nextTick(resolve, 0))
	}

	public abort(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.transaction.abort()
				resolve()
			} catch (error: any) {
				reject(error)
			}
		})
	}
}

//// => StoreObject
export enum StoreMethodKind {
  ReadOnly = 'readonly',
  ReadAndWrite = 'readwrite',
}

export enum StoreKind {
  Directory
}

export class StoreObject extends EventEmitter<'connected' | 'disconnect'> {
  // => store
  protected _indexed: IDBDatabase | null = null
  public get indexed () {
    invariant(this._indexed)
    return this._indexed
  }
  public set indexed (indexed: IDBDatabase) {
    this._indexed = indexed
  }

  public name: string  
  public root: string
  public version: number

  constructor (name: string, root: string, version: number) {
    super()

    this.name = name
    this.root = root ?? '/'
    this.version = version

    this.on('connected', () => this.transaction(StoreMethodKind.ReadAndWrite, async (tx) => {
      if (await tx.get(this.root) === undefined) {
        const current = new Date().getTime()
        const dirInode = new Inode(GenerateRandomID(), 4096, 511 | Sto.DIRECTORY, currTime, currTime, currTime, 0, 0);

        await tx.put(dirInode.id, getEmptyDirNode(), false);
        await tx.put(ROOT_NODE_ID, dirInode.toBuffer(), false);
        await tx.commit();
      }
    })    )
  }

	beginTransaction(kind: StoreMethodKind = StoreMethodKind.ReadOnly) {
		const transaction = this.indexed.transaction(this.name, kind)
		const object = transaction.objectStore(this.name)

		if (kind === StoreMethodKind.ReadAndWrite) {
			return new StoreTransaction(transaction, object)
		} else if (kind ===  StoreMethodKind.ReadOnly) {
			return new StoreTransaction(transaction, object)
		} else {
			throw new Error('Invalid transaction kind.')
		}
	}

  transaction (kind: StoreMethodKind = StoreMethodKind.ReadOnly, handle: TransactionHandle) {
    const transaction = this.beginTransaction(kind)

    return handle(this.beginTransaction(kind))
      .then(result => transaction.commit().then(() => result))
      .catch((error: any) => transaction.abort().then(() => Promise.reject(error)))
  }

  connect (): Promise<void> {
    return new Promise((resolve, reject) => {
      const indexedDB = getIndexedDB()
      invariant(indexedDB !== null, `Sorry, Your browser unsupport indexedDb.`)

      const request = indexedDB.open(this.name, this.version)
      request.onerror = reject
      request.onsuccess = (event: Event) => {
        if (event.target === null) {
          return reject(new Error('Failed to open indexedDB.'))
        }

        this.indexed = (event.target as IDBOpenDBRequest).result as IDBDatabase
        resolve(void 0)
      }

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const indexed = (event.target as IDBOpenDBRequest).result ?? null
        if (indexed.objectStoreNames.contains(this.name)) {
					indexed.deleteObjectStore(this.name)
				}

        indexed.createObjectStore(this.name)
      }
    }).then(() => { this.emit('connected') })
  }

  disconnect () {
    this._indexed?.close()
    this._indexed = null
    return Promise.resolve().then(() => this.emit('disconnected'))
  }
}
