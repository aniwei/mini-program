import { View } from 'react-native'
import { Simulator } from '@components/Simulator'

export interface SimulatorLayoutProps {
  
}

export const SimulatorLayout: React.FC<SimulatorLayoutProps> = ({  }) => {
  return (
    <View style={{
      flex: 1,
      justifyContent: `center`,
      alignItems: `center`
    }}>
      <Simulator />
    </View>
  )
}