import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useChatStore } from '../../store/useChatStore';
import { Send, Image as ImageIcon, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function DoubtSolverScreen() {
    const { messages, addMessage } = useChatStore();
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userQuery = inputText;
        addMessage('user', userQuery);
        setInputText('');
        setIsTyping(true);

        // Mock API call to an LLM
        setTimeout(() => {
            let reply = "I can help with that! However, since I'm running in demo mode, my knowledge is mocked. Try asking about 'Bernoulli' to see a detailed response, or upload a note!";

            if (userQuery.toLowerCase().includes('bernoulli')) {
                reply = "Bernoulli's principle states that for an inviscid flow of a nonconducting fluid, an increase in the speed of the fluid occurs simultaneously with a decrease in pressure or a decrease in the fluid's potential energy. The equation is: P + 1/2 ρv² + ρgh = constant.";
            } else if (userQuery.toLowerCase().includes('practice') || userQuery.toLowerCase().includes('quiz')) {
                reply = "Here's a quick practice question based on your uploaded notes on Thermodynamics:\n\nQ: What is the first law of thermodynamics?\n\nA) Energy cannot be created or destroyed\nB) Entropy always increases\nC) Absolute zero cannot be reached\n\nReply with A, B, or C!";
            }

            addMessage('assistant', reply);
            setIsTyping(false);
        }, 1500);
    };

    const handleAttachImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });

        if (!result.canceled) {
            addMessage('user', '[Image Attached: Question snippet]');
            setIsTyping(true);

            setTimeout(() => {
                addMessage('assistant', "I see you've uploaded an image of a physics problem involving fluid dynamics. Let me break down the steps to solve it for you. First, we need to apply the continuity equation A1V1 = A2V2...");
                setIsTyping(false);
            }, 2000);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <Text style={styles.title}>Ask AI </Text>
                    <Sparkles size={24} color="#D69E2E" />
                </View>
                <Text style={styles.subtitle}>Supercharge your learning.</Text>
            </View>

            <FlatList
                ref={flatListRef}
                style={styles.chatList}
                contentContainerStyle={styles.chatListContent}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                        <Text style={[styles.messageText, item.role === 'user' && styles.userText]}>
                            {item.text}
                        </Text>
                    </View>
                )}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                ListFooterComponent={isTyping ? (
                    <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                        <ActivityIndicator size="small" color="#805AD5" />
                    </View>
                ) : null}
            />

            <View style={styles.inputContainer}>
                <Pressable style={styles.attachBtn} onPress={handleAttachImage}>
                    <ImageIcon size={24} color="#718096" />
                </Pressable>
                <TextInput
                    style={styles.input}
                    placeholder="Ask a question..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <Pressable
                    style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                >
                    <Send size={20} color={inputText.trim() ? '#FFFFFF' : '#A0AEC0'} />
                </Pressable>
            </View>
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
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    chatList: {
        flex: 1,
    },
    chatListContent: {
        padding: 20,
        paddingBottom: 40,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#805AD5',
        borderBottomRightRadius: 5,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 5,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    typingBubble: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    messageText: {
        fontSize: 16,
        color: '#2D3748',
        lineHeight: 24,
    },
    userText: {
        color: '#FFFFFF',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingBottom: Platform.OS === 'ios' ? 30 : 15, // extra padding for iOS home indicator if outside safe area
    },
    attachBtn: {
        padding: 10,
        marginRight: 5,
    },
    input: {
        flex: 1,
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 16,
        maxHeight: 100,
        color: '#2D3748',
    },
    sendBtn: {
        backgroundColor: '#805AD5',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    sendBtnDisabled: {
        backgroundColor: '#EDF2F7',
    },
});
