import debug from 'debug'
import invariant from 'ts-invariant'
import { useProgram } from '@stores/program'
import { SyntheticEvent, useCallback } from 'react'
import { NavigationProp } from '@react-navigation/native'

type ListenerHandle = () => void

const view_debug = debug(`app:hooks:wxview`)

export const useView = (path: string, navigation: NavigationProp<{}>) => {
  const program = useProgram(state => state)  

  return useCallback(async (event: SyntheticEvent<HTMLIFrameElement>) => {
    path = path ?? null

    view_debug('创建 WxView %s', path)

    invariant(program.app !== null)
    invariant(path !== null)

    const view = await program.app?.routing(event.currentTarget, {
      path,
    }) ?? null

    view.navigation = navigation
  }, [path])
}