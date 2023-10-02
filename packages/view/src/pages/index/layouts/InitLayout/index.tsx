
import { ReactElement, ReactFragment } from 'react'
import { Text, View } from 'react-native'
import { WxApiStateKind } from '@catalyze/api'
import { useWx } from '@stores/wx'

const WxState = () => {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Text style={{
        fontWeight: `500`,
        color: `rgba(26, 115, 232, 1)`,
        textDecorationLine: `underline`
      }} >正在启动...</Text>
    </View>
  )
}

export interface InitLayoutProps {
  children: ReactElement | ReactFragment
}

export const InitLayout: React.FC<InitLayoutProps> = ({ children }) => {
  const wx = useWx(state => state)

  if (
    wx.state === WxApiStateKind.Connected || 
    wx.state === WxApiStateKind.Disconnected
  ) {
    return <>{children}</>
  }

  return <WxState />
}