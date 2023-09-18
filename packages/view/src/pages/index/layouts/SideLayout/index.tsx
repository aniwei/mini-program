import { View } from 'react-native'
import { UserLayout } from '../UserLayout'

export const SideLayout = () => {
  return (
    <View style={{
      width: 60,
      paddingBottom: 12,
      shadowColor: 'rgba(33, 33, 52, 0.1)',
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 1
      },
      flexDirection: 'column',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      alignItems: 'center'
    }}>
      <View style={{
        maxWidth: 1920
      }}><UserLayout /></View>
    </View>
  )
}
