import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import NoticesScreen from '../screens/NoticesScreen';
import AgendaScreen from '../screens/AgendaScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupPlaceholderScreen from '../screens/GroupPlaceholderScreen';
import SocialMediaScreen from '../screens/SocialMediaScreen';
import BibleScreen from '../screens/BibleScreen';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const GroupStack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.primary,
  },
};

function GroupsNavigator() {
  return (
    <GroupStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundElevated },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <GroupStack.Screen
        name="ListaGrupos"
        component={GroupsScreen}
        options={{ title: 'Grupos' }}
      />
      <GroupStack.Screen
        name="GrupoDetalhe"
        component={GroupPlaceholderScreen}
        options={({ route }) => ({
          title: route.params?.groupName || 'Grupo',
        })}
      />
    </GroupStack.Navigator>
  );
}

export default function AppNavigator() {
  const { logout } = useAuth();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  const handleLogout = (navigation) => {
    Alert.alert(
      'Confirmar saída',
      'Deseja realmente sair e trocar de conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } finally {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Inicio' }],
              });
            }
          },
        },
      ]
    );
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: colors.backgroundElevated },
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          headerRight: () => (
            <Pressable onPress={() => handleLogout(navigation)} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={16} color={colors.textPrimary} />
              {!isCompact ? <Text style={styles.logoutText}>Sair</Text> : null}
            </Pressable>
          ),
          tabBarStyle: {
            backgroundColor: colors.backgroundElevated,
            borderTopColor: colors.border,
            height: isCompact ? 62 : 70,
            paddingTop: isCompact ? 4 : 6,
            paddingBottom: isCompact ? 6 : 8,
          },
          tabBarLabelStyle: {
            fontSize: isCompact ? 10 : 12,
            fontWeight: '600',
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          sceneStyle: { backgroundColor: colors.background },
        })}
      >
        <Tab.Screen
          name="Inicio"
          component={HomeScreen}
          options={{
            title: 'Início',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Comunicados"
          component={NoticesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="megaphone" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Agenda"
          component={AgendaScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Biblia"
          component={BibleScreen}
          options={{
            title: 'Biblia',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="GruposTab"
          component={GroupsNavigator}
          options={{
            title: 'Grupos',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="RedesSociais"
          component={SocialMediaScreen}
          options={{
            title: 'Redes Sociais',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="share-social" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    backgroundColor: colors.surface,
  },
  logoutText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});
