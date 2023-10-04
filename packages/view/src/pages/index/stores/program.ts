import { create } from 'zustand'
import { WxSettings, ProxyApp } from '@catalyze/wx'
import { api } from '../api'
import { Store } from '@catalyze/wx'
import { AssetHash } from '@catalyze/basic'
import type { WxAppJSON, WxProj } from '@catalyze/types'

export interface TabItem {
  route: string,
  label: string,
  icon?: string,
  selectedIcon?: string,
}

interface App {
  appid: string,
  assets: AssetHash[]
}


export enum ProgramStateKind {
  Init,
  Mount,
  Read,
  Inited,
  Run,
}

export interface ProgramState {
  wx: ProxyApp | null,
  apps: App[] | null,
  state: ProgramStateKind,
  store: Store | null,
  isLoading: boolean,
  tabItems: TabItem[],
  settings: WxSettings,

  setProgram: (state: Partial<ProgramState>) => void
}

export const useProgram = create<ProgramState>((set) => {
  Store.create().then((store) => {
    set({ store })

    
    store.ensure().then((apps) => {
      set({ apps, state: ProgramStateKind.Read })

      api.Program.commands.current().then((proj: WxProj) => {
        const app = apps.find((app) => {
          return app.appid === proj.appid
        }) ?? {
          appid: proj.appid,
          assets: []
        }

        store.read(app).then(assets => {
          set({ state: ProgramStateKind.Inited })
          api.Program.commands.getWxAssetsBundle(app.assets).then().then(bundle => { 
            if (bundle.assets.length > 0) {
              for (const asset of bundle.assets) {
                const current = assets.find((current) => {
                  if (current.relative === asset.relative) {
                    return current
                  }
                }) ?? null

                if (current !== null) {
                  asset.hash = current.hash
                  asset.source = current.source
                } else {
                  assets.push(asset)
                }
              }
            }
            
            store.save(proj.appid, bundle.assets).then(() => {
              const wx = ProxyApp.boot()
              const settings = useProgram.getState().settings

              set({ state: ProgramStateKind.Run })
  
              wx.init({
                root: bundle.root,
                assets
              }, settings).then(() => {
                const app = wx.findByFilename('app.json').data as WxAppJSON
          
                const state: Partial<ProgramState> = {
                  wx: wx,
                  settings: {
                    ...settings,
                    entry: app.pages[0],
                    path: app.pages[0]
                  }
                }
          
                if (app.tabBar) {
                  state.tabItems = app.tabBar.custom ? [] : app.tabBar.list.map(tabItem => {
                    return {
                      label: tabItem.text,
                      route: tabItem.pagePath,
                      icon: tabItem.unselectedIcon,
                      selectedIcon: tabItem.selectedIcon
                    }
                  })
                }
          
                set(state)
              })
            })
          })
        })
      })
      
    })
  })

  return {
    wx: null,
    apps: null,
    store: null,
    state: ProgramStateKind.Init,
    isLoading: false,
    tabItems: [],
    settings: {
      version: '2.33.0',
      account: {
        appid: ''
      },
      scene: 1001,
      path: 'pages/index/index',
      entry: 'pages/index/index',
      // path: 'example/index',
      // entry: 'example/index',
      size: {
        width: 375,
        height: 814
      },
      env: {
        USER_DATA_PATH: '/usr'
      }
    },

    setProgram (state: Partial<ProgramState>) {
      set({ ...state })
    }
  }
})