import debug from 'debug'
import { ReactElement, ReactFragment, useCallback } from 'react'
import { View, Text, Image } from 'react-native'
import { WxApiState } from '@catalyze/wx-api'
import { useWx } from '@stores/wx'
import { WxQRCodeState } from '@catalyze/wx-api'

const auth_debug = debug(`app:layouts:auth`)

const WxQRCodeLiftcycle = () => {
  const wx = useWx(state => state)

  if (WxQRCodeState.Alive === wx.QRCodeState) {
    return null
  }

  return <View style={{
    borderRadius: 4,
    backgroundColor: `rgba(0, 0, 0, .7)`,
    position: `absolute`,
    justifyContent: `center`,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  }}>
    <Text style={{
      marginTop: 10,
      fontSize: 12,
      color: `rgba(255, 255, 255, 1)`,
      textAlign: 'center'
    }}>
      {
        wx.QRCodeState === WxQRCodeState.Scanned 
          ? `已扫码` 
          : <>已失效，<Text style={{
            textDecorationLine: 'underline'
          }}>刷新二维码</Text></>
      }
    </Text>
  </View>
}

const WxQRCode = () => {
  const wx = useWx(state => state)

  return (
    <View>
      <View style={{
        shadowColor: `rgba(33, 33, 52, 0.1)`,
        shadowRadius: 4,
        shadowOffset: {
          width: 0,
          height: 1
        },
        borderRadius: 4,
        justifyContent: `center`,
        alignItems: `center`,
        backgroundColor: `rgba(255, 255, 255, 1)`,
      }}>
        <Image style={{
          width: 200,
          height: 200
        }} source={{ uri: wx.QRCodeURL as string }} />
        <WxQRCodeLiftcycle />
      </View>
      <Text style={{
        color: `rgba(164, 164, 164, 1)`,
        fontSize: 12,
        marginTop: 12,
        textAlign: 'center'
      }}>请使用手机微信客户端扫码</Text>
    </View>
  )
}


const WxReconnect = () => {
  const wx = useWx(state => state)

  const onPress = useCallback(() => {
    if (wx.state === WxApiState.Disconnected || wx.state === WxApiState.Error) {
      wx.api.reconnect()
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
          wx.state === WxApiState.Error 
            ? <>服务器连接错误，<WxReconnect /></>
            : wx.state === WxApiState.Disconnected 
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
    return <WxQRCode />
  }

  return <WxState />
}
