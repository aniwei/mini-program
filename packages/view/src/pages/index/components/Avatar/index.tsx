import { View, Image } from 'react-native'

export interface AvatarProps {
  uri: string
}

export const Avatar: React.FC<AvatarProps> = ({ uri }) => {
  return (
    <View style={{
      backgroundColor: `rgba(164, 164, 164, 1)`,
      height: 36,
      width: 36,
      borderRadius: 36
    }}>
      <Image style={{
        height: 36,
        width: 36,
        borderRadius: 36
      }} source={{ uri }} />
    </View>
  )
}
