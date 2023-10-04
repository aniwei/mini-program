export enum FileNodeKind {
  File = 0o100000,
  Directory = 0o40000
}

export class FileNode {
  public mode: number

	public isFile(): boolean {
		return (this.mode & 0xf000) === FileNodeKind.File
	}

	/**
	 * @return [Boolean] True if this item is a directory.
	 */
	public isDirectory(): boolean {
		return (this.mode & 0xf000) === FileNodeKind.Directory
	}
}