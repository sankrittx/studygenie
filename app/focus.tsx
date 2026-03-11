import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlannerStore } from '../store/usePlannerStore';
import { X, Play, Pause, CheckCircle2 } from 'lucide-react-native';

export default function FocusScreen() {
    const { taskId } = useLocalSearchParams();
    const router = useRouter();
    const { tasks, updateTaskStatus } = usePlannerStore();

    const task = tasks.find(t => t.id === taskId);

    const initialSeconds = task ? task.durationMinutes * 60 : 25 * 60;

    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            handleComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleComplete = () => {
        if (task) {
            updateTaskStatus(task.id, 'completed');
        }
        Alert.alert(
            'Session Complete!',
            `Great job tracking ${task?.durationMinutes} minutes of focused study.`,
            [{ text: 'Return to Planner', onPress: () => router.back() }]
        );
    };

    const confirmExit = () => {
        Alert.alert(
            'End Session?',
            'Are you sure you want to exit focus mode? Your progress will not be saved.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => router.back() }
            ]
        );
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = 1 - (timeLeft / initialSeconds);

    if (!task) {
        return (
            <View style={styles.container}>
                <Text style={styles.subText}>Task not found.</Text>
                <Pressable onPress={() => router.back()} style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={confirmExit} style={styles.closeBtn}>
                    <X size={28} color="#A0AEC0" />
                </Pressable>
            </View>

            <View style={styles.mainContent}>
                <Text style={styles.title}>Focus Mode</Text>
                <Text style={styles.subject}>{task.subjectName}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>

                <View style={styles.timerContainer}>
                    {/* Progress Ring Background */}
                    <View style={styles.progressRingBg} />

                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>

                    <Pressable
                        style={styles.toggleBtn}
                        onPress={() => setIsActive(!isActive)}
                    >
                        {isActive ? (
                            <Pause size={32} color="#FFFFFF" fill="#FFFFFF" />
                        ) : (
                            <Play size={32} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 4 }} />
                        )}
                    </Pressable>
                </View>

                <Pressable style={styles.completeEarlyBtn} onPress={handleComplete}>
                    <CheckCircle2 size={20} color="#48BB78" />
                    <Text style={styles.completeEarlyText}>Mark Complete</Text>
                </Pressable>
            </View>
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
        alignItems: 'flex-end',
    },
    closeBtn: {
        padding: 10,
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 40,
    },
    title: {
        fontSize: 18,
        color: '#718096',
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    subject: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3748',
        marginTop: 15,
        textAlign: 'center',
    },
    taskTitle: {
        fontSize: 16,
        color: '#4A5568',
        marginTop: 10,
        textAlign: 'center',
    },
    timerContainer: {
        marginTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
        width: 280,
        height: 280,
    },
    progressRingBg: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        borderWidth: 10,
        borderColor: '#E2E8F0',
    },
    timerText: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#2D3748',
        fontVariant: ['tabular-nums'],
    },
    toggleBtn: {
        marginTop: 30,
        backgroundColor: '#805AD5',
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#805AD5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    completeEarlyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 60,
        backgroundColor: '#F0FFF4',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#9AE6B4',
    },
    completeEarlyText: {
        marginLeft: 8,
        color: '#48BB78',
        fontWeight: 'bold',
        fontSize: 16,
    },
    subText: {
        color: '#718096',
        fontSize: 18,
        marginBottom: 20,
    },
    actionBtn: {
        backgroundColor: '#805AD5',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 20,
    },
    actionBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});
