import { NavigationContainer } from '@react-navigation/native'
import { useProgram } from '@stores/program'
import { useApp } from '@hooks/useApp'
import { TabBar } from './components/TabBar'
import { Stack } from './components/Stack'
import { WxLoader } from './components/Loader'

export const WxMiniProgram = () => {
  const program = useProgram(state => state)
  const tabItems = program.tabItems

  return (
    <NavigationContainer ref={useApp()}>
      <WxLoader uri={""} name={""}>
        { 
          tabItems.length > 0 
            ? <TabBar tabItems={tabItems}  /> 
            : <Stack path={program.settings.entry} /> 
        }
      </WxLoader>
    </NavigationContainer>
  )
}