import debug from 'debug'
import { useNavigationContainerRef } from '@react-navigation/native'

const app_debug = debug(`wx:hooks:app`)

export const useApp = () => {
  const navigationRef = useNavigationContainerRef()


  return navigationRef
}