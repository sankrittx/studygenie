import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, ActionSheetIOS } from 'react-native';
import { useRoutineStore, DayOfWeek } from '../../store/useRoutineStore';
import { Plus, Trash2, Clock, MapPin, UploadCloud, CheckCircle2, XCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RoutineScreen() {
    const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
    const [isAdding, setIsAdding] = useState(false);
    const [subjectName, setSubjectName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [roomNumber, setRoomNumber] = useState('');

    const classes = useRoutineStore((state) => state.classes);
    const addClass = useRoutineStore((state) => state.addClass);
    const removeClass = useRoutineStore((state) => state.removeClass);
    const markAttendance = useRoutineStore((state) => state.markAttendance);

    console.log("--> RoutineScreen RENDERING! Total classes in Zustand state:", classes.length);

    // Reactively filter classes so it updates instantly when Firebase emits a new snapshot
    const todayClasses = classes
        .filter((c) => c.day === selectedDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const handleAddSubmit = () => {
        if (!subjectName || !startTime || !endTime) {
            Alert.alert('Missing fields', 'Please enter subject name, start time, and end time.');
            return;
        }

        // basic time check
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            Alert.alert('Invalid time format', 'Please use HH:MM format (24 hour). Example: 09:30');
            return;
        }

        addClass({
            day: selectedDay,
            subjectName,
            startTime,
            endTime,
            roomNumber,
        });

        setSubjectName('');
        setStartTime('');
        setEndTime('');
        setRoomNumber('');
        setIsAdding(false);
    };

    const handleUploadSmartRoutine = async () => {
        Alert.alert(
            'Upload Routine',
            'Upload an image or document of your class timetable. StudyGenie AI will extract and schedule your classes automatically.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Upload Image',
                    onPress: async () => {
                        let result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            quality: 1,
                        });
                        if (!result.canceled) {
                            Alert.alert('Analysis Started', 'Mock: AI is extracting your classes from the image...');
                        }
                    }
                },
                {
                    text: 'Upload PDF',
                    onPress: async () => {
                        let result = await DocumentPicker.getDocumentAsync({
                            type: 'application/pdf',
                        });
                        if (!result.canceled) {
                            Alert.alert('Analysis Started', 'Mock: AI is extracting your classes from the PDF...');
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.header}>
                <Text style={styles.title}>Class Routine</Text>
                <Pressable style={styles.uploadBtnHeader} onPress={handleUploadSmartRoutine}>
                    <UploadCloud size={20} color="#805AD5" />
                    <Text style={styles.uploadBtnText}>Auto-Extract</Text>
                </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
                <View style={styles.daysContainer}>
                    {DAYS.map((day) => (
                        <Pressable
                            key={day}
                            style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
                            onPress={() => setSelectedDay(day)}
                        >
                            <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>
                                {day.substring(0, 3)}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
                {todayClasses.length === 0 && !isAdding ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No classes scheduled for {selectedDay}.</Text>
                        <Text style={styles.emptySubtext}>Enjoy your free time or add a class!</Text>
                    </View>
                ) : (
                    todayClasses.map((cls) => {
                        const attendancePercentage = cls.totalClasses > 0
                            ? Math.round((cls.attendedClasses / cls.totalClasses) * 100)
                            : 100;

                        return (
                            <View key={cls.id} style={styles.classCard}>
                                <View style={styles.classCardHeader}>
                                    <Text style={styles.subjectName}>{cls.subjectName}</Text>
                                    <Pressable onPress={() => removeClass(cls.id)}>
                                        <Trash2 size={20} color="#E53E3E" />
                                    </Pressable>
                                </View>
                                <View style={styles.classDetailsRow}>
                                    <View style={styles.detailItem}>
                                        <Clock size={16} color="#718096" />
                                        <Text style={styles.detailText}>{cls.startTime} - {cls.endTime}</Text>
                                    </View>
                                    {cls.roomNumber ? (
                                        <View style={styles.detailItem}>
                                            <MapPin size={16} color="#718096" />
                                            <Text style={styles.detailText}>{cls.roomNumber}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                {/* Attendance Section */}
                                <View style={styles.attendanceContainer}>
                                    <View style={styles.attendanceInfo}>
                                        <Text style={styles.attendanceLabel}>Attendance</Text>
                                        <Text style={[
                                            styles.attendancePercent,
                                            { color: attendancePercentage < 75 ? '#E53E3E' : '#48BB78' }
                                        ]}>
                                            {attendancePercentage}%
                                        </Text>
                                        <Text style={styles.attendanceStats}>({cls.attendedClasses}/{cls.totalClasses})</Text>
                                    </View>
                                    <View style={styles.attendanceActions}>
                                        <Pressable
                                            style={[styles.attBtn, styles.attBtnPresent]}
                                            onPress={() => markAttendance(cls.id, 'attended')}
                                        >
                                            <CheckCircle2 size={16} color="#48BB78" />
                                        </Pressable>
                                        <Pressable
                                            style={[styles.attBtn, styles.attBtnMissed]}
                                            onPress={() => markAttendance(cls.id, 'missed')}
                                        >
                                            <XCircle size={16} color="#E53E3E" />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        )
                    })
                )}

                {isAdding && (
                    <View style={styles.addForm}>
                        <Text style={styles.formTitle}>Add New Class</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Subject Name"
                            value={subjectName}
                            onChangeText={setSubjectName}
                        />
                        <View style={styles.timeRow}>
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                placeholder="Start (HH:MM)"
                                value={startTime}
                                onChangeText={setStartTime}
                                keyboardType="numbers-and-punctuation"
                            />
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                placeholder="End (HH:MM)"
                                value={endTime}
                                onChangeText={setEndTime}
                                keyboardType="numbers-and-punctuation"
                            />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Room Number (Optional)"
                            value={roomNumber}
                            onChangeText={setRoomNumber}
                        />

                        <View style={styles.formActions}>
                            <Pressable style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
                                <Text style={styles.cancelTxt}>Cancel</Text>
                            </Pressable>
                            <Pressable style={styles.saveBtn} onPress={handleAddSubmit}>
                                <Text style={styles.saveTxt}>Save Class</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </ScrollView>

            {!isAdding && (
                <Pressable style={styles.fab} onPress={() => setIsAdding(true)}>
                    <Plus color="#FFFFFF" size={24} />
                </Pressable>
            )}
        </KeyboardAvoidingView>
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    uploadBtnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EDF2F7',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    uploadBtnText: {
        marginLeft: 6,
        color: '#805AD5',
        fontWeight: '600',
        fontSize: 14,
    },
    daysScroll: {
        maxHeight: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    daysContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 10,
        alignItems: 'center',
    },
    dayChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: '#EDF2F7',
    },
    dayChipActive: {
        backgroundColor: '#805AD5',
    },
    dayText: {
        color: '#4A5568',
        fontWeight: '600',
    },
    dayTextActive: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    contentPadding: {
        padding: 20,
        paddingBottom: 100, // For FAB
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
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#718096',
    },
    classCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#805AD5',
    },
    classCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    subjectName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    classDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    detailText: {
        marginLeft: 5,
        color: '#718096',
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#805AD5',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#805AD5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    addForm: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        color: '#2D3748',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    cancelBtn: {
        padding: 12,
        marginRight: 10,
    },
    cancelTxt: {
        color: '#718096',
        fontWeight: '600',
        fontSize: 16,
    },
    saveBtn: {
        backgroundColor: '#805AD5',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    saveTxt: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    attendanceContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    attendanceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    attendanceLabel: {
        fontSize: 14,
        color: '#4A5568',
        fontWeight: '500',
        marginRight: 8,
    },
    attendancePercent: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    attendanceStats: {
        fontSize: 12,
        color: '#A0AEC0',
        marginLeft: 6,
    },
    attendanceActions: {
        flexDirection: 'row',
    },
    attBtn: {
        padding: 8,
        borderRadius: 8,
        marginLeft: 8,
        borderWidth: 1,
    },
    attBtnPresent: {
        borderColor: '#C6F6D5',
        backgroundColor: '#F0FFF4',
    },
    attBtnMissed: {
        borderColor: '#FED7D7',
        backgroundColor: '#FFF5F5',
    }
});
