import { View, Text } from 'react-native'
import { useProgram, ProgramStateKind } from '@stores/program'

import { SideLayout } from '../SideLayout'
import { ContentLayout } from '../ContentLayout'
import { AuthenticateLayout } from '../AuthenticateLayout'
import { InitLayout } from '../InitLayout'
import { SimulatorLayout } from '../SimulatorLayout'

const getModuleStateText = (state: ProgramStateKind) => {
  if (state ===  ProgramStateKind.Init) {
    return '文件系统初始化中...'
  } else if (state === ProgramStateKind.Read) {
    return '正在读取数据...'
  }
}

const ModuleState = () => {
  const program = useProgram(state => state)

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Text style={{
        fontWeight: `500`,
        color: `rgba(26, 115, 232, 1)`,
        textDecorationLine: `underline`
      }}>
        {getModuleStateText(program.state)}
      </Text>
    </View>
  )
}

export const BaseLayout = () => {
  const program = useProgram(state => state)

    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'stretch',
        flexDirection: 'row',
        backgroundColor: 'rgb(246, 246, 246)',
        height: '100%',
        width: '100%',
      }}> 
        {
          program.state >= ProgramStateKind.Inited
            ? (
              <InitLayout>
                <AuthenticateLayout>
                  <SideLayout />
                  <ContentLayout />
                </AuthenticateLayout>
              </InitLayout>
            ) : <ModuleState />
        }
      </View>
    )
}