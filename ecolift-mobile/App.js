import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// 👤 User Screens
import LocationDrawerScreen from "./screens/User Screens/LocationDrawerScreen";
import LocationFromScreen from "./screens/User Screens/LocationFromScreen";
import LocationToScreen from "./screens/User Screens/LocationToScreen";
import LoginScreen from "./screens/User Screens/LoginScreen";
import MainScreen from "./screens/User Screens/MainScreen";
import PopPremiumContactScreen from "./screens/User Screens/PopPremiumContactScreen";
import PremiumScreen from "./screens/User Screens/PremiumScreen";
import ProfileScreen from "./screens/User Screens/ProfileScreen";
import RideBookScreen from "./screens/User Screens/RideBookScreen";
import RideHistoryScreen from "./screens/User Screens/RideHistoryScreen";
import SignupScreen from "./screens/User Screens/SignupScreen";
import SupportScreen from "./screens/User Screens/SupportScreen";
import VerificationScreen from "./screens/User Screens/VerificationScreen";
import WelcomeScreen from "./screens/User Screens/WelcomeScreen";

// 🏍️ Rider Screens
import { RideProvider } from "./context/RideContext";
import { ToastProvider } from "./context/ToastContext";
import LoginScreenRider from "./screens/Rider Screens/LoginScreenRider";
import MainScreenRider from "./screens/Rider Screens/MainScreenRider";
import PopInfoConfirmation from "./screens/Rider Screens/PopInfoConfirmation";
import ProfileScreenRider from "./screens/Rider Screens/ProfileScreenRider";
import RideBookScreenRider from "./screens/Rider Screens/RideBookScreenRider";
import RideHistoryScreenRider from "./screens/Rider Screens/RideHistoryScreenRider";
import RiderInfoScreen from "./screens/Rider Screens/RiderInfoScreen";
import SignupScreenRider from "./screens/Rider Screens/SignupScreenRider";
import StoreScreen from "./screens/Rider Screens/StoreScreen";
import UserOrdersScreen from "./screens/Rider Screens/UserOrdersScreen";
import SupportScreenRider from "./screens/Rider Screens/SupportScreenRider";
import VerificationScreenRider from "./screens/Rider Screens/VerificationScreenRider";
import WelcomeScreenRider from "./screens/Rider Screens/WelcomeScreenRider";

const Stack = createStackNavigator();

const App = () => {
  return (
    <RideProvider>
      <ToastProvider>
        <NavigationContainer>
          
          <Stack.Navigator
            initialRouteName="WelcomeScreen"
            screenOptions={{ headerShown: false }}
          >
            {/* 👤 User Routes */}
            <Stack.Screen   name="WelcomeScreen" component={WelcomeScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen
              name="VerificationScreen"
              component={VerificationScreen}
            />
            <Stack.Screen name="MainScreen" component={MainScreen} />
            <Stack.Screen
              name="LocationDrawerScreen"
              component={LocationDrawerScreen}
            />
            <Stack.Screen
              name="LocationFromScreen"
              component={LocationFromScreen}
            />
            <Stack.Screen
              name="LocationToScreen"
              component={LocationToScreen}
            />
            <Stack.Screen name="PremiumScreen" component={PremiumScreen} />
            <Stack.Screen
              name="RideHistoryScreen"
              component={RideHistoryScreen}
            />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="RideBookScreen" component={RideBookScreen} />
            <Stack.Screen name="SupportScreen" component={SupportScreen} />
            <Stack.Screen
              name="PopPremiumContactScreen"
              component={PopPremiumContactScreen}
            />

            {/* 🏍️ Rider Routes */}
            <Stack.Screen
              name="WelcomeScreenRider"
              component={WelcomeScreenRider}
            />
            <Stack.Screen
              name="LoginScreenRider"
              component={LoginScreenRider}
            />
            <Stack.Screen
              name="SignupScreenRider"
              component={SignupScreenRider}
            />
            <Stack.Screen
              name="VerificationScreenRider"
              component={VerificationScreenRider}
            />
            <Stack.Screen name="RiderInfoScreen" component={RiderInfoScreen} />
            <Stack.Screen
              name="PopInfoConfirmation"
              component={PopInfoConfirmation}
            />
            <Stack.Screen name="MainScreenRider" component={MainScreenRider} />
            <Stack.Screen name="StoreScreen" component={StoreScreen} />
            <Stack.Screen name="UserOrdersScreen" component={UserOrdersScreen} />
            <Stack.Screen
              name="RideHistoryScreenRider"
              component={RideHistoryScreenRider}
            />
            <Stack.Screen
              name="ProfileScreenRider"
              component={ProfileScreenRider}
            />
            <Stack.Screen
              name="RideBookScreenRider"
              component={RideBookScreenRider}
            />
            <Stack.Screen
              name="SupportScreenRider"
              component={SupportScreenRider}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ToastProvider>
    </RideProvider>
  );
};

export default App;
