import { create } from 'zustand'
import { ProxyApp } from '@catalyze/wx'
import { WxSettings } from '@catalyze/wx'
import { WxAssetAppJSON } from '@catalyze/wx-asset'
import { api } from '../api'

export interface TabItem {
  route: string,
  label: string,
  icon?: string,
  selectedIcon?: string,
}

export interface ProgramState {
  app: ProxyApp | null,
  isLoading: boolean,
  tabItems: TabItem[],
  settings: WxSettings,
  set: (state: Partial<ProgramState>) => void
}

export const useProgram = create<ProgramState>((set) => {
  

  api.Program.commands.getWxAssetsBundle().then(assets => {
    const wx = ProxyApp.boot()
    wx.on('connected', () => {
      const settings = useProgram.getState().settings
      wx.init(assets, settings).then(() => {
        const app = wx.findByFilename('app.json').data as WxAssetAppJSON

        const state: Partial<ProgramState> = {
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


  return {
    app: null,
    isLoading: false,
    tabItems: [],
    settings: {
      version: '2.33.0',
      account: {
        appid: ''
      },
      scene: 1001,
      path: 'pages/dashboard/index',
      entry: 'pages/dashboard/index',
      size: {
        width: 375,
        height: 814
      },
      env: {
        USER_DATA_PATH: '/usr'
      }
    },
    set (state: Partial<ProgramState>) {
      set({ ...state })
    }
  }
})