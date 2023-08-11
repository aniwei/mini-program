import { invariant } from 'ts-invariant'
import { useWx } from '@stores/wx'
import { View, Image } from 'react-native'

interface AvatarProps {
  uri: string
}

const Avatar: React.FC<AvatarProps> = ({ uri }) => {
  return (
    <View style={{
      backgroundColor: `rgba(164, 164, 164, 1)`,
      height: 36,
      width: 36,
      borderRadius: 36
    }}>
      <Image source={{ uri }} />
    </View>
  )
}

export const UserLayout = () => {
  const wx = useWx(state => state)

  invariant(wx.user !== null)

  return (
    <View style={{
      
    }}>
      <Avatar uri={wx.user.avatarURL} />
    </View>
  )
}