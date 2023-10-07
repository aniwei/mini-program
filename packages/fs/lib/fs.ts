import path from 'path'
import { StoreKind, StoreObject } from './store'


type ExecHandle = () => {}

export class FileSystem extends StoreObject {
  public queue: ExecHandle[]

  exists (filename: string) {
    return this.get(path.resolve(this.root, filename)).then(result => !!result)
  }

  remove (filename: string) {
    return this.remove(path.resolve(this.root, filename))
  }

  copy () {

  }

  readFile (filename: string, data: unknown) {
    return this.put()
  }

  writeFile () {}
}