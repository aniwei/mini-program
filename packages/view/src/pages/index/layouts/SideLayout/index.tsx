import { View } from 'react-native'
import { UserLayout } from '../UserLayout'

export const SideLayout = () => {
  return (
    <View style={{
      width: 60,
      paddingBottom: 12,
      borderRightColor: 'rgb(234, 234, 239)',
      borderRightWidth: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      alignItems: 'center',
      zIndex: 10
    }}>
      <View style={{
        maxWidth: 1920
      }}><UserLayout /></View>
    </View>
  )
}
