import { View } from 'react-native'


export const Modal = () => {
  return (
    <View style={{
      width: 830,
      maxHeight: 327,
      backgroundColor: 'rgb(255, 255, 255)',
      borderRadius: 4,
      shadowColor: `rgba(33, 33, 52, 0.1)`,
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 1
      },
    }}>
      <View style={{
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomColor: 'rgb(234, 234, 239)',
        borderBottomWidth: 1,
        borderStyle: 'solid',
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 20,
        paddingRight: 20
      }}>
      </View>
      <View style={{
        padding: 32,
        overflow: 'scroll',
        flex: 1
      }}></View>
      <View style={{
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        borderTopColor: 'rgb(234, 234, 239)',
        borderTopWidth: 1,
        borderStyle: 'solid',
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 20,
        paddingRight: 20
      }}></View>
    </View>
  )
}