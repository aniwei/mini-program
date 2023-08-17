import debug from 'debug'
import React from 'react'
import { NavigationProp } from '@react-navigation/native'
import { useView } from '@hooks/useView'
import { useProgram } from '@stores/program'

const screen_debug = debug(`app:screen`)

export interface ScreenProps {
  path: string,
  navigation: NavigationProp<{}>
}

export const Screen: React.FC<ScreenProps> = ({ path, navigation }) => {
  screen_debug(`页面启动 <path: %s>`, path)
  const onLoad = useView(path, navigation)
  const size = useProgram(state => state).settings.size

  return (
    
    <iframe 
      width={size.width} 
      height={size.height} 
      style={{
        height: size.height,
        width: size.width,
        border: 'none'
      }} 
      src={`/view.html?path=${path}`} onLoad={onLoad} />
  )
}