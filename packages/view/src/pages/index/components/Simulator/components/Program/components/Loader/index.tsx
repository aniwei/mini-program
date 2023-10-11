import { ReactElement, useEffect, useRef } from 'react'
import { View, Image, Text, Animated, Easing } from 'react-native'
import { useProgram } from '@stores/program'

const useAnimated = (timeout: number) => {
  const rotation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 360 * 10,
        duration: timeout * 1000, 
        easing: Easing.linear, 
        useNativeDriver: true, 
      })
    ).start()
  }, [])

  return rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  })
}

export interface LoadingProps {
  name: string,
  uri: string
}
const Loading: React.FC<LoadingProps> = ({ name, uri }) => {
  const rotate = useAnimated(20)

  return (
    <View style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 1)'
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
          borderWidth: 3,
          borderColor: '#eeeeee',
          borderStyle: 'solid',
          transform: [{ rotate }],
        }]}>
          <View style={{
            position: 'absolute',
            left: 31,
            top: -3,
            height: 4,
            width: 4,
            borderRadius: 5,
            backgroundColor: '#06ae56'
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
        fontWeight: 'bold'
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
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 1)' 
    }}>
      { program.wx?.booted ? children :<Loading name={''} uri={''} {...props} /> }
    </View>
  )
}
