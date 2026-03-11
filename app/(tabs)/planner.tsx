import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlannerStore } from '../../store/usePlannerStore';
import { CheckCircle2, Circle, Play } from 'lucide-react-native';

export default function PlannerScreen() {
    const router = useRouter();
    const { tasks, updateTaskStatus } = usePlannerStore();

    // Group tasks by date
    const groupedTasks = tasks.reduce((acc, task) => {
        const date = task.date.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
    }, {} as Record<string, typeof tasks>);

    // Sort dates
    const sortedDates = Object.keys(groupedTasks).sort();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Study Planner</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
                {sortedDates.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Your planner is empty.</Text>
                        <Text style={styles.emptySubtext}>Upload some class notes to let AI generate study tasks for you!</Text>
                    </View>
                ) : (
                    sortedDates.map(dateStr => (
                        <View key={dateStr} style={styles.dateGroup}>
                            <Text style={styles.dateHeader}>
                                {new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Text>

                            {groupedTasks[dateStr].map(task => (
                                <View key={task.id} style={[styles.taskCard, task.status === 'completed' && styles.taskCardCompleted]}>
                                    <Pressable
                                        style={styles.taskLeft}
                                        onPress={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                                    >
                                        {task.status === 'completed' ? (
                                            <CheckCircle2 size={24} color="#48BB78" />
                                        ) : (
                                            <Circle size={24} color="#CBD5E0" />
                                        )}
                                        <View style={styles.taskInfo}>
                                            <Text style={[styles.taskSubject, task.status === 'completed' && styles.taskTextCompleted]}>
                                                {task.subjectName}
                                                {task.isSpacedRepetition && <Text style={styles.repBadge}> 🔄 Revision</Text>}
                                            </Text>
                                            <Text style={[styles.taskTitle, task.status === 'completed' && styles.taskTextCompleted]}>{task.title}</Text>
                                        </View>
                                    </Pressable>

                                    {task.status !== 'completed' && (
                                        <Pressable
                                            style={styles.startBtn}
                                            onPress={() => router.push(`/focus?taskId=${task.id}`)}
                                        >
                                            <Play size={16} color="#FFFFFF" />
                                            <Text style={styles.startBtnText}>{task.durationMinutes}m</Text>
                                        </Pressable>
                                    )}
                                </View>
                            ))}
                        </View>
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
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    content: {
        flex: 1,
    },
    contentPadding: {
        padding: 20,
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#4A5568',
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#718096',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    dateGroup: {
        marginBottom: 25,
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 12,
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
        borderLeftWidth: 3,
        borderLeftColor: '#805AD5',
    },
    taskCardCompleted: {
        backgroundColor: '#F7FAFC',
        borderLeftColor: '#CBD5E0',
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
        fontSize: 16,
    },
    taskTitle: {
        color: '#718096',
        fontSize: 14,
        marginTop: 4,
    },
    taskTextCompleted: {
        textDecorationLine: 'line-through',
        color: '#A0AEC0',
    },
    repBadge: {
        fontSize: 12,
        color: '#DD6B20',
        fontWeight: 'normal',
    },
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#805AD5',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
    },
    startBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginLeft: 5,
    },
});
