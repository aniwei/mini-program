import { View } from 'react-native'
import { useProgram } from '@stores/program'
import { Capsule } from '../Capsule'
import { WxMiniProgram } from './components/Program'


export const Simulator = () => {
  const size = useProgram(state => state).settings.size

  return (
    <View style={{ 
      flexDirection: 'column',
      justifyContent: 'center', 
      overflow: 'hidden',
      backgroundColor: `rgba(255, 255, 255, 1)`,
      shadowColor: `rgba(33, 33, 52, 0.1)`,
        shadowRadius: 4,
        shadowOffset: {
          width: 0,
          height: 1
        },
        borderRadius: 4,
        width: size.width,
        height: size.height
    }}>
      <Capsule />
      <View style={{
        height: `100%`,
        width: `100%`,
      }}>
        <WxMiniProgram />
      </View>
    </View>
  )
}