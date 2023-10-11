import { View, Image, TouchableOpacity } from 'react-native'

import more from '../../assets/capsule-more.svg'
import exit from '../../assets/capsule-exit.svg'


export const Capsule = () => {
  return (
    <View style={{
      position: `absolute`,
      backgroundColor: `rgba(0,0,0,.15)`,
      top: 24,
      right: 7,
      height: 32,
      width: 87,
      borderRadius: 24,
      borderColor: `hsla(0,0%,100%,.25)`,
      borderWidth: 1,
      borderStyle: `solid`,
      flexDirection: `row`,
      alignItems: `center`,
      zIndex: 100
    }}>
      <TouchableOpacity style={{
         flex: 1,
         justifyContent: `center`,
         alignItems: `center`,
      }}>
        <View style={{
          flex: 1,
          height: 30,
          justifyContent: `center`,
          alignItems: `center`,
          paddingTop: 6.4,
          paddingBottom: 6.4,
          backgroundColor: `transparent`
        }}>
          <Image style={{
            height: 7,
            width: 22
          }} source={{ uri: more }} />
        </View>
      </TouchableOpacity>

      <View style={{
        minWidth: 1,
        height: 17.2,
        backgroundColor: `hsla(0,0%,100%,.25)`
      }}></View>

      <TouchableOpacity style={{
         flex: 1,
         justifyContent: `center`,
         alignItems: `center`,
      }}>
        <View style={{
          flex: 1,
          height: 30,
          justifyContent: `center`,
          alignItems: `center`,
          paddingTop: 6.4,
          paddingBottom: 6.4,
          backgroundColor: `transparent`
        }}>
          <Image style={{
            height: 17,
            width: 17
          }}  source={{ uri: exit }} />
        </View>
      </TouchableOpacity>
    </View>
  )
}