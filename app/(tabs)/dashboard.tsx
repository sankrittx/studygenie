import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useRoutineStore, DayOfWeek } from '../../store/useRoutineStore';
import { useUserStore } from '../../store/useUserStore';
import { CheckCircle2, Circle, Clock, Flame } from 'lucide-react-native';

const DAYS_SHORT = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DashboardScreen() {
    const router = useRouter();
    const tasks = usePlannerStore((state) => state.tasks);
    const generateDailyPlan = usePlannerStore((state) => state.generateDailyPlan);
    const updateTaskStatus = usePlannerStore((state) => state.updateTaskStatus);

    const allClasses = useRoutineStore((state) => state.classes);
    const { profile } = useUserStore();

    const todayDate = new Date();
    const todayISO = todayDate.toISOString();
    const todayPrefix = todayISO.split('T')[0];
    const todayDayName = DAYS_SHORT[todayDate.getDay()] as DayOfWeek;

    // Reactively filter tasks and classes so they update instantly when Firebase emits a new snapshot
    const todayTasks = tasks.filter((t) => t.date.startsWith(todayPrefix));

    const todayClasses = allClasses
        .filter((c) => c.day === todayDayName)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Calculate dynamic time greeting
    const currentHour = todayDate.getHours();
    let timeGreeting = 'Good Morning';
    if (currentHour >= 12 && currentHour < 17) {
        timeGreeting = 'Good Afternoon';
    } else if (currentHour >= 17) {
        timeGreeting = 'Good Evening';
    }

    useEffect(() => {
        // Generate a plan to fill in any missing subjects the user has added to their routine
        if (todayClasses.length > 0) {
            // Extract unique subjects from TODAY'S classes to build the study plan
            const uniqueSubjects = new Set(todayClasses.map(c => c.subjectName));

            const subjectsPayload = Array.from(uniqueSubjects).map(subjectName => ({
                name: subjectName,
                credits: 3 // Default fallback credit
            }));

            // generateDailyPlan now handles deduplication natively to append only new subjects
            generateDailyPlan(subjectsPayload);
        }
    }, [todayTasks.length, todayClasses.length]);

    const completedCount = todayTasks.filter(t => t.status === 'completed').length;
    const progress = todayTasks.length > 0 ? (completedCount / todayTasks.length) : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{timeGreeting}, {profile?.name ? profile.name.split(' ')[0] : 'Student'}!</Text>
                    <Text style={styles.date}>{todayDate.toDateString()}</Text>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>

                {/* Progress Card */}
                <View style={styles.progressCard}>
                    <Text style={styles.missionText}>Today's Mission</Text>

                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressStatus}>{completedCount} of {todayTasks.length} sessions completed</Text>
                </View>

                {/* Classes Section */}
                {todayClasses.length > 0 && (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Classes</Text>
                    </View>
                )}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classesScroll}>
                    {todayClasses.map(cls => (
                        <View key={cls.id} style={styles.classCard}>
                            <Text style={styles.classSubject}>{cls.subjectName}</Text>
                            <View style={styles.timeRow}>
                                <Clock size={14} color="#718096" />
                                <Text style={styles.classTime}>{cls.startTime} - {cls.endTime}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Tasks Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Study Schedule</Text>
                    <Pressable onPress={() => router.push('/(tabs)/planner')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </Pressable>
                </View>

                {todayTasks.length === 0 ? (
                    <Text style={styles.emptyText}>No study tasks scheduled for today.</Text>
                ) : (
                    todayTasks.map(task => (
                        <Pressable
                            key={task.id}
                            style={[styles.taskCard, task.status === 'completed' && styles.taskCardCompleted]}
                            onPress={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                        >
                            <View style={styles.taskLeft}>
                                {task.status === 'completed' ? (
                                    <CheckCircle2 size={24} color="#48BB78" />
                                ) : (
                                    <Circle size={24} color="#CBD5E0" />
                                )}
                                <View style={styles.taskInfo}>
                                    <Text style={[styles.taskSubject, task.status === 'completed' && styles.taskTextCompleted]}>{task.subjectName}</Text>
                                    <Text style={[styles.taskTitle, task.status === 'completed' && styles.taskTextCompleted]}>{task.title}</Text>
                                </View>
                            </View>
                            <View style={styles.durationBadge}>
                                <Text style={styles.durationText}>{task.durationMinutes}m</Text>
                            </View>
                        </Pressable>
                    ))
                )}

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
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    date: {
        color: '#718096',
        marginTop: 4,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFAF0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FBD38D',
    },
    streakText: {
        marginLeft: 4,
        color: '#DD6B20',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    contentPadding: {
        padding: 20,
        paddingBottom: 40,
    },
    progressCard: {
        backgroundColor: '#805AD5',
        borderRadius: 20,
        padding: 24,
        marginBottom: 25,
        shadowColor: '#805AD5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    missionText: {
        color: '#E9D8FD',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        marginBottom: 10,
    },
    progressBarFill: {
        height: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
    },
    progressStatus: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    seeAll: {
        color: '#805AD5',
        fontWeight: '600',
    },
    classesScroll: {
        marginBottom: 25,
    },
    classCard: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 15,
        marginRight: 15,
        minWidth: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderLeftWidth: 3,
        borderLeftColor: '#3182CE',
    },
    classSubject: {
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 8,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    classTime: {
        marginLeft: 5,
        color: '#718096',
        fontSize: 12,
    },
    emptyText: {
        color: '#A0AEC0',
        textAlign: 'center',
        marginTop: 20,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    taskCardCompleted: {
        backgroundColor: '#F7FAFC',
        opacity: 0.7,
    },
    taskLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    taskInfo: {
        marginLeft: 15,
        flex: 1,
    },
    taskSubject: {
        fontWeight: 'bold',
        color: '#2D3748',
        fontSize: 14,
    },
    taskTitle: {
        color: '#718096',
        fontSize: 12,
        marginTop: 2,
    },
    taskTextCompleted: {
        textDecorationLine: 'line-through',
        color: '#A0AEC0',
    },
    durationBadge: {
        backgroundColor: '#EDF2F7',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    durationText: {
        color: '#4A5568',
        fontWeight: 'bold',
        fontSize: 12,
    },
});
