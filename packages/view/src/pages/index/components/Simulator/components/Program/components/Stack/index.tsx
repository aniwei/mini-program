import { createStackNavigator } from '@react-navigation/stack'
import { Screen } from '../Screen'

const StackNavigator = createStackNavigator()

export interface StackProps {
  path: string,
}

export const Stack: React.FC<StackProps> = ({ path }) => {
  return <StackNavigator.Navigator>
    <StackNavigator.Screen 
      name='view'
      options={{
        headerMode: 'float'
      }}
      component={(props: any) => {
        const route = props.route
        return <Screen path={route.params?.path ?? path} {...props} />
      }}
    />
  </StackNavigator.Navigator>
}