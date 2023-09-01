import { invariant } from 'ts-invariant'
import { useWx } from '@stores/wx'
import { View } from 'react-native'
import { Avatar } from '@components/Avatar'



export const UserLayout = () => {
  const wx = useWx(state => state)

  invariant(wx.user !== null)

  return (
    <View style={{}}>
      <Avatar uri={wx.user.avatarURL} />
    </View>
  )
}