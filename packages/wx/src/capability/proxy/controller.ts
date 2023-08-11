import invariant from 'ts-invariant'
import { NavigationContainerRef, StackActions } from '@react-navigation/native'
import { WxCapability } from '..'
import { ProxyApp } from '../../app'

export class Controller extends WxCapability {
  static kSymbol = Symbol.for('controller')
  static create (proxy: ProxyApp): Promise<Controller> {
    return new Promise((resolve) => {
      resolve(new Controller(proxy))
    })
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
      .on('navigateTo', this.navigateTo)
      .on('navigateBack', this.navigateBack)
  }

  navigateTo = (data: { url: string }) => {
    return Promise.resolve().then(() => {
      let url = data.url.replace(/^\/|\.html$/g, '')

      if (url.indexOf('/') === 0) {
        url = data.url.slice(1)
      }
      
      this.navigation.dispatch(StackActions.push('view', {
        path: url
      }))
    })
  }

  navigateBack = (delta: number = -1) => {
    return Promise.resolve().then(() => {
      this.navigation.dispatch(StackActions.pop(delta))
    })
  }
  
}