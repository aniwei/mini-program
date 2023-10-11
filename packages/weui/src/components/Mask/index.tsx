import { View } from 'react-native'

export interface MaskProps {
  transparent?: boolean
}

export const Mask: React.FC<MaskProps> = ({ transparent }) => {
  const styles = transparent 
    ? {
      position: 'absolute',
      zIndex: 1000,
      top: 0,
      right: 0,
      left: 0,
      bottom: 0
    } : {}

  return (
    <View style={{ backgroundColor: 'rgba(0, 0, 0, .6)', ...styles }}>
      
    </View>
  )
}