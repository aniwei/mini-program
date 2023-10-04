import { SimulatorLayout } from '@layouts/SimulatorLayout'
import { View, Text } from 'react-native'


const ContentAside = () => {
  return (
    <View style={{
      height: '100%',
      minWidth: 232,
      flexDirection: 'column',
      backgroundColor: 'rgb(246, 246, 249)',
      borderRightColor: 'rgb(220, 220, 228)',
      borderRightWidth: 1,
    }}>
      <View style={{
        paddingTop: 24,
        paddingBottom: 8,
        paddingLeft: 24,
        paddingRight: 16,
      }}>
        <Text style={{
          fontSize: 18,
          lineHeight: 22.5,
          color: 'rgb(50, 50, 77)',
        }}>侧栏</Text>
      </View>
    </View>
  )
}


export const ContentLayout = () => {
  return <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgb(246, 246, 249)'
  }}>
    <ContentAside />
    <SimulatorLayout />
  </View>
}