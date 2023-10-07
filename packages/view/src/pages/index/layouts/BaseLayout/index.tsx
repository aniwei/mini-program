import { View, Text } from 'react-native'
import { useProgram, ProgramStateKind } from '@stores/program'
import { useWx } from '@stores/wx'
import { WxApiStateKind } from '@catalyzed/api'
import { api } from '@api'
import { useCallback } from 'react'

import { SideLayout } from '../SideLayout'
import { ContentLayout } from '../ContentLayout'
import { AuthenticateLayout } from '../AuthenticateLayout'
import { InitLayout } from '../InitLayout'

const getModuleStateText = (state: ProgramStateKind) => {
  if (state ===  ProgramStateKind.Init) {
    return '文件系统初始化中...'
  } else if (state === ProgramStateKind.Read) {
    return '正在读取数据...'
  }
}

const getApiStateText = (state: WxApiStateKind) => {
  const onPress = useCallback(() => {
    api.reconnect ()
  }, [state])

  if (state ===  WxApiStateKind.Connecting) {
    return <>连接中...</>
  } else if (state === WxApiStateKind.Error) {
    return <>连接异常，<Text onPress={onPress} style={{
      textDecorationLine: `underline`
    }}>重新连接</Text></>
  }
}

const ModuleState = () => {
  const program = useProgram(state => state)

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Text style={{
        fontWeight: `500`,
        color: `rgba(26, 115, 232, 1)`,
      }}>
        {getModuleStateText(program.state)}
      </Text>
    </View>
  )
}

const ApiState = () => {
  const wx = useWx(state => state)

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Text style={{
        fontWeight: `500`,
        color: `rgba(26, 115, 232, 1)`,
      }}>
        {getApiStateText(wx.state)}
      </Text>
    </View>
  )
}

export const BaseLayout = () => {
  const program = useProgram(state => state)
  const wx = useWx(state => state)

    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'stretch',
        flexDirection: 'row',
        backgroundColor: 'rgb(246, 246, 246)',
        height: '100%',
        width: '100%',
      }}> 
        {
          wx.state === WxApiStateKind.Connected ? (
            program.state >= ProgramStateKind.Inited
              ? (
                <InitLayout>
                  <AuthenticateLayout>
                    <SideLayout />
                    <ContentLayout />
                  </AuthenticateLayout>
                </InitLayout>
              ) : <ModuleState />
          ) : <ApiState />
          
        }
      </View>
    )
}