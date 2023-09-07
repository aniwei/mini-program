import { View } from 'react-native'
import { Simulator } from '@components/Simulator'
import { Button } from '@components/Button'
import { Select } from '@components/Select'

export interface SimulatorLayoutProps {
  
}

export const SimulatorLayout: React.FC<SimulatorLayoutProps> = ({  }) => {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Select variant="tertiary">测试</Select>
      <Button variant="tertiary">测试</Button>
      <Simulator />
    </View>
  )
}