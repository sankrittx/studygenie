import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useUserStore } from '../../store/useUserStore';
import { Target, TrendingUp, Zap, Clock, LogOut } from 'lucide-react-native';
import { auth } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function AnalyticsScreen() {
    const { tasks } = usePlannerStore();
    const { reset: resetUser } = useUserStore();
    const router = useRouter();

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const totalFocusMinutes = completedTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
    const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

    // Calculate dynamic stats for the past 7 days
    const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const now = new Date();
    const past7DaysData = [];
    let weeklyFocusMins = 0;

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const prefix = d.toISOString().split('T')[0];
        const dayLabel = DAYS_SHORT[d.getDay()];

        const dayTasks = completedTasks.filter(t => t.date.startsWith(prefix));
        const dayMins = dayTasks.reduce((acc, t) => acc + t.durationMinutes, 0);

        past7DaysData.push({ label: dayLabel, mins: dayMins });
        weeklyFocusMins += dayMins;
    }

    const weeklyMaxMins = Math.max(...past7DaysData.map(d => d.mins), 60);

    // Calculate current streak
    let streak = 0;
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const prefix = d.toISOString().split('T')[0];
        const hasTask = completedTasks.some(t => t.date.startsWith(prefix));
        if (hasTask) {
            streak++;
        } else if (i > 0) {
            // Missing a previous day breaks the streak. 
            // Missing today doesn't break it immediately until tomorrow.
            break;
        }
    }

    const insightSubject = completedTasks.length > 0
        ? completedTasks[completedTasks.length - 1].subjectName
        : 'your subjects';

    const handleLogout = async () => {
        try {
            await signOut(auth);
            resetUser();
            router.replace('/onboarding');
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Study Insights</Text>
                    <Text style={styles.subtitle}>Your progress this week</Text>
                </View>
                <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                    <LogOut size={20} color="#E53E3E" />
                </Pressable>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#EBF4FF' }]}>
                            <Clock size={24} color="#3182CE" />
                        </View>
                        <Text style={styles.statValue}>{totalFocusHours}h</Text>
                        <Text style={styles.statLabel}>Total Focus Time</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFFAF0' }]}>
                            <Zap size={24} color="#DD6B20" />
                        </View>
                        <Text style={styles.statValue}>{streak} Days</Text>
                        <Text style={styles.statLabel}>Current Streak</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#F0FFF4' }]}>
                            <Target size={24} color="#38A169" />
                        </View>
                        <Text style={styles.statValue}>{completedTasks.length}</Text>
                        <Text style={styles.statLabel}>Tasks Done</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#FAF5FF' }]}>
                            <TrendingUp size={24} color="#805AD5" />
                        </View>
                        <Text style={styles.statValue}>{(weeklyFocusMins / 60).toFixed(1)}h</Text>
                        <Text style={styles.statLabel}>This Week</Text>
                    </View>
                </View>

                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Weekly Study Progress</Text>
                    <View style={styles.mockChart}>
                        {past7DaysData.map((data, i) => {
                            const heightPercentage = Math.round((data.mins / weeklyMaxMins) * 100);
                            return (
                                <View key={i} style={styles.barColumn}>
                                    <View style={[styles.bar, { height: `${heightPercentage}%` }]} />
                                    <Text style={styles.barLabel}>{data.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>StudyGenie Suggestion</Text>
                    <Text style={styles.insightText}>
                        {completedTasks.length > 0
                            ? `You've been making great progress on ${insightSubject}. Review your notes periodically to boost long-term retention!`
                            : `Check your Daily Planner to start focusing and build a learning streak. You can add your syllabus in the Routine tab!`}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    subtitle: {
        color: '#718096',
        marginTop: 4,
    },
    content: {
        flex: 1,
    },
    contentPadding: {
        padding: 20,
        paddingBottom: 40,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        width: '48%',
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        alignItems: 'center',
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 13,
        color: '#718096',
    },
    chartCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 20,
    },
    mockChart: {
        flexDirection: 'row',
        height: 150,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    barColumn: {
        alignItems: 'center',
        width: 30,
        height: '100%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: 20,
        backgroundColor: '#805AD5',
        borderRadius: 4,
        minHeight: 10,
    },
    barLabel: {
        marginTop: 10,
        color: '#718096',
        fontSize: 12,
    },
    insightCard: {
        backgroundColor: '#EBF4FF',
        padding: 20,
        borderRadius: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#3182CE',
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B6CB0',
        marginBottom: 8,
    },
    insightText: {
        color: '#4A5568',
        lineHeight: 22,
    },
});
