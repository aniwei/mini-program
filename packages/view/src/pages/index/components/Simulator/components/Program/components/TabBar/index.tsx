import { Image } from 'react-native'
import { TabItem } from '@stores/program'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Screen } from '../Screen'


const BottomNavigator = createBottomTabNavigator()


export interface TabBarProps {
  tabItems: TabItem[]
}

export const TabBar: React.FC<TabBarProps> = ({ tabItems }) => {
  return <BottomNavigator.Navigator>
    {
      tabItems.map(tabItem => {
        return <BottomNavigator.Screen
          key={tabItem.route}
          name={tabItem.route}
          component={(props: any) => {
            const route = props.route
            return <Screen path={route.params?.path ?? tabItem.route} {...props} />
          }}
          options={{
            tabBarLabel: tabItem.label,
            tabBarIcon: (options) => {
              const icon = options.focused 
                ? tabItem.selectedIcon 
                : tabItem.icon

              const uri = `data:image/png;base64,${icon}`

              return <Image style={{
                width: 24, 
                height: 24
              }} source={{ uri }} />
            }
          }}
        />
      })
    }
  </BottomNavigator.Navigator>
}