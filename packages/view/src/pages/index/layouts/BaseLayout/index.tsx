import { View } from 'react-native'
import { useWx } from '@stores/wx'

import { SideLayout } from '../SideLayout'
import { ContentLayout } from '../ContentLayout'
import { AuthenticateLayout } from '../AuthenticateLayout'
import { InitLayout } from '../InitLayout'
import { SimulatorLayout } from '../SimulatorLayout'


export const BaseLayout = () => {
  useWx(state => state)

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
      <InitLayout>
        <AuthenticateLayout>
          <SideLayout />
          <ContentLayout />
          <SimulatorLayout />
        </AuthenticateLayout>
      </InitLayout>
    </View>
  )
}