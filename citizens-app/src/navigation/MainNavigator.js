import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import { theme } from '../config/theme';

// Screens
import ReportsScreen from '../screens/main/ReportsScreen';
import ReportDetailScreen from '../screens/main/ReportDetailScreen';
import CreateReportScreen from '../screens/main/CreateReportScreen';
import MapScreen from '../screens/main/MapScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import MyReportsScreen from '../screens/main/MyReportsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Common header component with quick report button
const getHeaderComponent = (navigation) => ({
  header: () => (
    <Header
      rightButton={true}
      onRightButtonPress={() => navigation.navigate('CreateReport')}
      rightButtonIcon="add"
    />
  ),
});

// Stack navigators for each tab
const ReportsStack = ({ navigation }) => (
  <Stack.Navigator screenOptions={getHeaderComponent(navigation)}>
    <Stack.Screen name="ReportsList" component={ReportsScreen} />
    <Stack.Screen 
      name="ReportDetail" 
      component={ReportDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreateReport" 
      component={CreateReportScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const MapStack = ({ navigation }) => (
  <Stack.Navigator screenOptions={getHeaderComponent(navigation)}>
    <Stack.Screen name="MapView" component={MapScreen} />
    <Stack.Screen 
      name="ReportDetail" 
      component={ReportDetailScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ProfileStack = ({ navigation }) => (
  <Stack.Navigator screenOptions={getHeaderComponent(navigation)}>
    <Stack.Screen name="ProfileView" component={ProfileScreen} />
    <Stack.Screen 
      name="MyReports" 
      component={MyReportsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreateReport" 
      component={CreateReportScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ReportDetail" 
      component={ReportDetailScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingBottom: theme.spacing.xs + 1,
          paddingTop: theme.spacing.xs + 1,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: theme.fonts.sizes.xs,
          fontWeight: theme.fonts.weights.medium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Reports" 
        children={({ navigation }) => <ReportsStack navigation={navigation} />}
        options={{ tabBarLabel: 'Reports' }}
      />
      <Tab.Screen 
        name="Map" 
        children={({ navigation }) => <MapStack navigation={navigation} />}
        options={{ tabBarLabel: 'Map' }}
      />
      <Tab.Screen 
        name="Profile" 
        children={({ navigation }) => <ProfileStack navigation={navigation} />}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;