declare global {
  interface Window {
    exparser: {
      triggerEvent (element: HTMLElement, type: string, event: unknown): void
    }
  }
}