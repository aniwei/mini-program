import Animated from 'react-native-reanimated'
import { ReactElement } from 'react'
import { View, Image, Text } from 'react-native'
import { useSharedValue, useDerivedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useProgram } from '@stores/program'

export interface LoadingProps {
  name: string,
  uri: string
}
const Loading: React.FC<LoadingProps> = ({ name, uri }) => {
  const rotation = useSharedValue(0)
  const dv = useDerivedValue(() => {
    console.log(rotation.value)
    return rotation.value
  }, [rotation])
  const animated = useAnimatedStyle(() => {
    return {}
  }, [dv.value])

  return (
    <View style={{
      position: `absolute`,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: `rgba(255, 255, 255, 1)`
    }}>
      <View style={{
        height: 68,
        width: 68,
      }}>
        <Animated.View style={[{
          height: 68,
          width: 68,
          justifyContent: 'center', 
          alignItems: 'center',
          borderRadius: 68,
          borderWidth: 2,
          borderColor: `#eeeeee`,
          borderStyle: `solid`
        }, animated]}>
          <View style={{
            position: 'absolute',
            left: 31,
            top: -3,
            height: 4,
            width: 4,
            borderRadius: 5,
            backgroundColor: `#06ae56`
          }}></View>
        </Animated.View>
        <Image 
          source={{ uri }} 
          style={{
            position: 'absolute',
            left: 5,
            top: 5,
            height: 58,
            width: 58,
            borderRadius: 58,
          }}
        />
      </View>
      <Text style={{
        marginTop: 16,
        fontSize: 16,
        fontWeight: `bold`
      }}>{name}</Text>
    </View>
  )
}

export interface WxLoaderProps {
  name?: string,
  uri?: string,
  children: ReactElement
}

export const WxLoader: React.FC<WxLoaderProps> = (props) => {
  const program = useProgram(state => state)
  const { children } = props

  return (
    <View style={{ 
      width: `100%`,
      height: `100%`,
      backgroundColor: `rgba(255, 255, 255, 1)` 
    }}>
      { program.app?.isStarted ? children :<Loading name={''} uri={''} {...props} /> }
    </View>
  )
}
