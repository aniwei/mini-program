import { useMemo } from 'react'
import { TouchableHighlight, Text } from 'react-native'

export interface ButtonProps {
  size?: 'S' | 'M' | 'L',
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary'
}

export const Button: React.FC<ButtonProps> = (props) => {
  const { size, variant, children } = props
  const height = useMemo(() => {
    const baseHeight = 32
    let factor = 1
    if (size === 'S') {
      factor = 1
    } else if (size === 'M') {
      factor = 1.25
    } else if (size === 'L') {
      factor = 1.5
    }

    return baseHeight * factor
  }, [size])

  const style = useMemo(() => {
    const style = {
      borderColor: 'rgb(22, 75, 178)',
      backgroundColor: 'rgb(22, 75, 178)',
    }

    if (variant === 'secondary') {
      style.borderColor = 'rgb(217, 216, 255)'
      style.backgroundColor = 'rgb(240, 240, 255)'
    } else if (variant === 'tertiary') {
      style.borderColor = 'rgb(220, 220, 228)'
      style.backgroundColor = 'rgb(255, 255, 255)'
    }

    return style
  }, [variant])

  const color = useMemo(() => {
    let color = 'rgb(255, 255, 255)'
    if (variant === 'secondary') {
      color = 'rgb(39, 31, 224)'
    } else if (variant === 'tertiary') {
      color = 'rgb(50, 50, 77)'
    }
    return color
  }, [variant])

  return (
    <TouchableHighlight style={[{
      height,
      borderWidth: 1,
      borderStyle: 'solid',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 8,
      paddingBottom: 8,
      borderRadius: 3,
    }, style]}>
      <Text style={{
        fontSize: 14,
        color
      }}>{children}</Text>
    </TouchableHighlight>
  )
}