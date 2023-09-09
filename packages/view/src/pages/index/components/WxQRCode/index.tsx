import { View, Text, Image } from 'react-native'
import { WxQRCodeStateKind } from '@catalyze/wx-api'

interface WxQRCodeLiftcycleProps {
  state: WxQRCodeStateKind
}

const WxQRCodeLiftcycle: React.FC<WxQRCodeLiftcycleProps> = ({ state }) => {
  if (WxQRCodeStateKind.Alive === state) {
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
        state === WxQRCodeStateKind.Scanned 
          ? `已扫码` 
          : <>已失效，<Text style={{
            textDecorationLine: 'underline'
          }}>刷新二维码</Text></>
      }
    </Text>
  </View>
}

interface WxQRCodeProps extends WxQRCodeLiftcycleProps {
  uri: string
}

export const WxQRCode: React.FC<WxQRCodeProps> = ({ uri, state, }) => {

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
        }} source={{ uri }} />
        <WxQRCodeLiftcycle state={state}  />
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