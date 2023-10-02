import { create } from 'zustand'
import { WxSettings, ProxyApp } from '@catalyze/wx'
import { api } from '../api'
import type { WxAppJSON } from '@catalyze/types'

export interface TabItem {
  route: string,
  label: string,
  icon?: string,
  selectedIcon?: string,
}

export interface ProgramState {
  wx: ProxyApp | null,
  isLoading: boolean,
  tabItems: TabItem[],
  settings: WxSettings,
  set: (state: Partial<ProgramState>) => void
}

export const useProgram = create<ProgramState>((set) => {
  
  api.Program.commands.getWxAssetsBundle().then(assets => {
    const wx = ProxyApp.boot()
    const settings = useProgram.getState().settings
    wx.init(assets, settings).then(() => {
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


  return {
    wx: null,
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
    set (state: Partial<ProgramState>) {
      set({ ...state })
    }
  }
})