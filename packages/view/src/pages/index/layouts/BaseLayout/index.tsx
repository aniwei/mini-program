import { View } from 'react-native'
import { useWx } from '@stores/wx'

import { UserLayout } from '../UserLayout'
import { AuthenticateLayout } from '../AuthenticateLayout'
import { InitLayout } from '../InitLayout'
import { SimulatorLayout } from '../SimulatorLayout'


const SideLayout = () => {
  return (
    <View style={{
      width: 60,
      height: '100%',
      paddingBottom: 12,
      shadowColor: 'rgba(33, 33, 52, 0.1)',
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 1
      },
      // borderBottomColor: `rgba(0, 0, 0, .1)`,
      // borderBottomWidth: 0.5,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      alignItems: 'center'
    }}>
      <View style={{
        maxWidth: 1920
      }}>
        <UserLayout />
      </View>
    </View>
  )
}


export const BaseLayout = () => {
  useWx(state => state)

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      flexDirection: `row`,
      backgroundColor: 'rgb(246, 246, 246)',
      height: '100%',
      width: '100%'
    }}> 
      <InitLayout>
        <AuthenticateLayout>
          <SideLayout />
          <SimulatorLayout />
        </AuthenticateLayout>
      </InitLayout>
    </View>
  )
}