import { ReactNode } from 'react'
import { View, Text } from 'react-native'

interface BoxProps {
  title: string,
  children: ReactNode
}

export const Box: React.FC<BoxProps> = ({ title, children }) => {
  return (
    <View style={{
      flex: 1,
      alignItems: 'stretch',
      flexDirection: 'column',
      backgroundColor: 'rgb(255, 255, 255)',
      paddingTop: 24,
      paddingBottom: 24,
      paddingLeft: 32,
      paddingRight: 32,
      borderRadius: 4,
      shadowColor: `rgba(33, 33, 52, 0.1)`,
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 1
      },
      gap: 16
    }}>
      { 
        title 
          ? <Text style={{
            fontSize: 16,
            lineHeight: 1.25,
            color: 'rgb(50, 50, 77)'
          }}>{title}</Text> 
          : null 
      }
      <View style={{
        gap: 20
      }}>
        {children}
      </View>
    </View>
  )
}