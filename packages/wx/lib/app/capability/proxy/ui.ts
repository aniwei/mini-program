import { invariant } from 'ts-invariant'
import { ProxyApp } from '../..'
import { WxCapability } from '../../../capability'

import type { NavigationContainerRef } from '@react-navigation/native'

export class UI extends WxCapability<ProxyApp> {
  static kSymbol = Symbol.for('ui')
  static create (proxy: ProxyApp): Promise<UI> {
    return new Promise((resolve) => resolve(new UI(proxy)))
  }

  // => navigation
  protected _navigation: NavigationContainerRef<{}> | null = null
  public get navigation () {
    invariant(this._navigation !== null, `The member "navigation" cannot be null.`)
    return this._navigation
  }
  public set navigation (navigation: NavigationContainerRef<{}>) {
    invariant(navigation !== null, `The argument "navigation" cannot be null.`)
    this._navigation = navigation
  }

  constructor (proxy: ProxyApp) {
    super(proxy)

    this
      .on('showToast', this.showToast)
      .on('showNavigationBarLoading', this.showNavigationBarLoading)
      .on('setNavigationBarTitle', this.setNavigationBarTitle)
      .on('setNavigationBarColor', this.setNavigationBarColor)
  }

  showToast = (data: unknown) => {
    return Promise.resolve().then(() => {
      // return useWx.getState().api.Program.commands.createRequestTask(data)
    })
  }

  showNavigationBarLoading = (options: unknown) => {

  }

  setNavigationBarTitle = ({ title }: { title: string}) => {
    return Promise.resolve().then(() => {
      const view = this.proxy.findFocusingView() ?? null
      if (view !== null) {
        view.navigation.setOptions({
          title
        })
      }
    })
  }

  setNavigationBarColor = () => {

  }

}