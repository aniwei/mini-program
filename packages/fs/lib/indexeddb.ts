export const getIndexedDB = () => {
  try {
		return globalThis.indexedDB || (<any>globalThis).mozIndexedDB || (<any>globalThis).webkitIndexedDB || globalThis.msIndexedDB
	} catch {
		return null
	}
}