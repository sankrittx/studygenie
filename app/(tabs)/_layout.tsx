import { Tabs } from 'expo-router';
import { Book, Calendar, MessageCircle, FileText, BarChart3, Clock } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#805AD5',
                tabBarInactiveTintColor: '#A0AEC0',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E2E8F0',
                    paddingBottom: 5,
                    paddingTop: 5,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Today',
                    tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="planner"
                options={{
                    title: 'Planner',
                    tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="notes"
                options={{
                    title: 'Notes',
                    tabBarIcon: ({ color, size }) => <Book color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="routine"
                options={{
                    title: 'Routine',
                    tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="doubt-solver"
                options={{
                    title: 'Ask AI',
                    tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Insights',
                    tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
