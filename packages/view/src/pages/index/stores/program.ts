import { create } from 'zustand'
import { ProxyApp } from '@catalyze/wx'
import { WxSettings } from '@catalyze/wx'

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