import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNotesStore, NoteType } from '../../store/useNotesStore';
import { analyzeDocumentWithAI } from '../../services/AIAnalyzer';
import { Plus, Trash2, FileText, Image as ImageIcon, Book, Zap } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function NotesScreen() {
    const { notes, addNote, removeNote, getSubjects, getNotesBySubject } = useNotesStore();
    const subjects = getSubjects();

    const [selectedSubject, setSelectedSubject] = useState<string | null>(subjects.length > 0 ? subjects[0] : null);
    const [isAdding, setIsAdding] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [subjectName, setSubjectName] = useState('');
    const [lectureTitle, setLectureTitle] = useState('');

    const displayedNotes = selectedSubject ? getNotesBySubject(selectedSubject) : [];

    const handleUploadImage = async () => {
        if (!subjectName || !lectureTitle) {
            Alert.alert('Missing fields', 'Enter subject name and lecture title before uploading.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });

        if (!result.canceled) {
            processUpload(result.assets[0].uri, 'image');
        }
    };

    const handleUploadPDF = async () => {
        if (!subjectName || !lectureTitle) {
            Alert.alert('Missing fields', 'Enter subject name and lecture title before uploading.');
            return;
        }

        let result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
        });

        if (!result.canceled) {
            processUpload(result.assets[0].uri, 'pdf');
        }
    };

    const processUpload = async (uri: string, type: NoteType) => {
        setIsAnalyzing(true);
        try {
            // Mock AI extraction
            const analysis = await analyzeDocumentWithAI(uri, type);

            addNote({
                subjectName,
                lectureTitle,
                type,
                uri,
                date: new Date().toISOString(),
                extractedTopics: analysis.topics,
            });

            // Tasks could be saved to planner store here
            Alert.alert('Analysis Complete', `StudyGenie extracted ${analysis.topics.length} topics and generated study tasks.`);

            setSubjectName('');
            setLectureTitle('');
            setIsAdding(false);
            setSelectedSubject(subjectName);
        } catch (e) {
            Alert.alert('Error', 'Failed to analyze notes.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.header}>
                <Text style={styles.title}>Notes Library</Text>
            </View>

            {subjects.length > 0 && !isAdding && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectsScroll}>
                    <View style={styles.subjectsContainer}>
                        {subjects.map((sub) => (
                            <Pressable
                                key={sub}
                                style={[styles.subjectChip, selectedSubject === sub && styles.subjectChipActive]}
                                onPress={() => setSelectedSubject(sub)}
                            >
                                <Text style={[styles.subjectText, selectedSubject === sub && styles.subjectTextActive]}>
                                    {sub}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            )}

            <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
                {!isAdding ? (
                    displayedNotes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Book size={48} color="#CBD5E0" />
                            <Text style={styles.emptyText}>No notes found.</Text>
                            <Text style={styles.emptySubtext}>Tap + to upload notes & let AI summarize them.</Text>
                        </View>
                    ) : (
                        displayedNotes.map((note) => (
                            <View key={note.id} style={styles.noteCard}>
                                <View style={styles.noteHeader}>
                                    <View style={styles.noteTitleRow}>
                                        {note.type === 'image' ? <ImageIcon size={20} color="#805AD5" /> : <FileText size={20} color="#805AD5" />}
                                        <Text style={styles.lectureTitle}>{note.lectureTitle}</Text>
                                    </View>
                                    <Pressable onPress={() => removeNote(note.id)}>
                                        <Trash2 size={20} color="#E53E3E" />
                                    </Pressable>
                                </View>
                                <Text style={styles.noteDate}>{new Date(note.date).toLocaleDateString()}</Text>

                                {note.extractedTopics && note.extractedTopics.length > 0 && (
                                    <View style={styles.topicsContainer}>
                                        <View style={styles.topicsTitleRow}>
                                            <Zap size={14} color="#D69E2E" />
                                            <Text style={styles.topicsTitle}>AI Extracted Topics:</Text>
                                        </View>
                                        {note.extractedTopics.map((topic, i) => (
                                            <Text key={i} style={styles.topicText}>• {topic}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))
                    )
                ) : (
                    <View style={styles.addForm}>
                        <Text style={styles.formTitle}>Upload New Notes</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Subject Name (e.g. Fluid Mechanics)"
                            value={subjectName}
                            onChangeText={setSubjectName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Lecture Title (e.g. Chapter 4 - Bernoulli)"
                            value={lectureTitle}
                            onChangeText={setLectureTitle}
                        />

                        {isAnalyzing ? (
                            <View style={styles.analyzingContainer}>
                                <ActivityIndicator size="large" color="#805AD5" />
                                <Text style={styles.analyzingText}>AI is studying your notes...</Text>
                            </View>
                        ) : (
                            <View style={styles.uploadOptions}>
                                <Pressable style={styles.uploadCard} onPress={handleUploadImage}>
                                    <ImageIcon size={32} color="#4A5568" />
                                    <Text style={styles.uploadCardText}>Camera / Gallery</Text>
                                </Pressable>
                                <Pressable style={styles.uploadCard} onPress={handleUploadPDF}>
                                    <FileText size={32} color="#4A5568" />
                                    <Text style={styles.uploadCardText}>PDF Document</Text>
                                </Pressable>
                            </View>
                        )}

                        {!isAnalyzing && (
                            <Pressable style={styles.cancelFormBtn} onPress={() => setIsAdding(false)}>
                                <Text style={styles.cancelFormTxt}>Cancel</Text>
                            </Pressable>
                        )}
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
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    subjectsScroll: {
        maxHeight: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    subjectsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 10,
        alignItems: 'center',
    },
    subjectChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: '#EDF2F7',
    },
    subjectChipActive: {
        backgroundColor: '#805AD5',
    },
    subjectText: {
        color: '#4A5568',
        fontWeight: '600',
    },
    subjectTextActive: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    contentPadding: {
        padding: 20,
        paddingBottom: 100,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        marginTop: 40,
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
    noteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noteTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    lectureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginLeft: 10,
        flexShrink: 1,
    },
    noteDate: {
        color: '#A0AEC0',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 30, // align with title
        marginBottom: 15,
    },
    topicsContainer: {
        backgroundColor: '#F7FAFC',
        padding: 15,
        borderRadius: 10,
    },
    topicsTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    topicsTitle: {
        fontWeight: '600',
        color: '#2D3748',
        marginLeft: 5,
        fontSize: 14,
    },
    topicText: {
        color: '#4A5568',
        fontSize: 14,
        marginBottom: 4,
        marginLeft: 5,
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
    uploadOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    uploadCard: {
        width: '48%',
        backgroundColor: '#EDF2F7',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    uploadCardText: {
        marginTop: 10,
        color: '#4A5568',
        fontWeight: '600',
    },
    analyzingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzingText: {
        marginTop: 15,
        color: '#805AD5',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelFormBtn: {
        marginTop: 20,
        padding: 15,
        alignItems: 'center',
    },
    cancelFormTxt: {
        color: '#718096',
        fontWeight: '600',
        fontSize: 16,
    },
});
