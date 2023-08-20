import invariant from 'ts-invariant'
import { useEffect } from 'react'
import { NavigationContainerRef, useNavigationContainerRef } from '@react-navigation/native'
import { useProgram } from '@stores/program'

export const useApp = () => {
  const navigationRef = useNavigationContainerRef()
  const program = useProgram(state => state)

  useEffect(() => {
    if (navigationRef.current !== null && program.wx !== null) {
      program.wx.navigation = navigationRef.current as NavigationContainerRef<{}>
    }
  }, [program.wx])

  return navigationRef
}