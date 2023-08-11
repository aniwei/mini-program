import { View } from 'react-native'
import { Mask } from '../Mask'
import { ReactElement, ReactFragment } from 'react'

export interface HalfScreenProps {
  visible: boolean,
  header?: ReactElement,
  children: ReactElement | ReactFragment
} 

export const HalfScreen: React.FC<HalfScreenProps> = (props) => {
  return <View style={{
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 255,
    maxHeight: '75%',
    zIndex: 5000,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    paddingLeft: 24,
    paddingRight: 24,
    display: 'flex',
    flexDirection: 'column',
  }}>
    <Mask />
    {props.header}
    <View style={{
      flex: 1,
      minHeight: 0,
      overflow: 'scroll',
      paddingBottom: 56,
    }}>{props.children}</View>
  </View>
}

export interface HalfScreenHeaderProps {
  children: ReactElement | ReactFragment
}


export const HalfScreenHeader: React.FC<HalfScreenHeaderProps> = (props) => {
  return (
    <View style={{
      minHeight: 64,
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0
    }}>
      {props.children}
    </View>
  )
}