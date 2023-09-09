import debug from 'debug'
import { ReactElement, ReactFragment, useCallback } from 'react'
import { View, Text } from 'react-native'
import { WxApiStateKind } from '@catalyze/wx-api'
import { useWx } from '@stores/wx'
import { WxQRCode } from '@components/WxQRCode'
import { api } from '../../api'

const auth_debug = debug(`app:layouts:auth`)

const WxReconnect = () => {
  const wx = useWx(state => state)

  const onPress = useCallback(() => {
    if (wx.state === WxApiStateKind.Disconnected || wx.state === WxApiStateKind.Error) {
      api.reconnect()
    }
  }, [wx.state])

  return (
    <Text style={{
      fontWeight: `500`,
      color: `rgba(26, 115, 232, 1)`,
      textDecorationLine: `underline`
    }} onPress={onPress}>重新连接</Text>
  )
}

const WxState = () => {
  const wx = useWx(state => state)

  auth_debug(`WxState 状态 <state: %s>`, wx.state)

  return (
    <View>
      <Text style={{
        fontSize: 14
      }}>
        {
          wx.state === WxApiStateKind.Error 
            ? <>服务器连接错误，<WxReconnect /></>
            : wx.state === WxApiStateKind.Disconnected 
              ? <>已断开连接，<WxReconnect /></>
              : `连接服务器中...`
        }
      </Text>
    </View>
  )
}

export interface AuthenticateLayoutProps {
  children: ReactElement | ReactFragment
}

export const AuthenticateLayout: React.FC<AuthenticateLayoutProps> = ({ children }) => {
  const wx = useWx(state => state)

  if (wx.user !== null) {
    return <>{children}</>
  }

  if (wx.QRCodeURL !== null) {
    return <WxQRCode 
      uri={wx.QRCodeURL} 
      state={wx.QRCodeState} 
    />
  }

  return <WxState />
}
