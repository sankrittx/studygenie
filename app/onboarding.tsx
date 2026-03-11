import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/useUserStore';
import { Sparkles } from 'lucide-react-native';

import { auth, db } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function OnboardingScreen() {
    const router = useRouter();
    const setProfile = useUserStore(state => state.setProfile);

    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [semester, setSemester] = useState('');
    const [courseName, setCourseName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email.trim() || !password.trim()) {
            alert('Please enter an email and password.');
            return;
        }

        if (!isLogin && (!name.trim() || !semester.trim() || !courseName.trim())) {
            alert('Please fill out all profile fields to sign up.');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                // Log In
                const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
                const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile({ name: data.name, semester: data.semester, courseName: data.courseName });
                }
                router.replace('/(tabs)/dashboard');
            } else {
                // Sign Up
                const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
                const uid = userCredential.user.uid;

                const profileData = {
                    name: name.trim(),
                    semester: semester.trim(),
                    courseName: courseName.trim()
                };

                // Save profile to Firestore
                await setDoc(doc(db, 'users', uid), profileData);

                // Save locally
                setProfile(profileData);
                router.replace('/(tabs)/dashboard');
            }
        } catch (error: any) {
            alert(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <Sparkles size={40} color="#805AD5" />
                <Text style={styles.title}>Welcome to StudyGenie</Text>
                <Text style={styles.subtitle}>Let's personalize your learning experience.</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="student@university.edu"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor="#A0AEC0"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        placeholderTextColor="#A0AEC0"
                        secureTextEntry
                    />
                </View>

                {!isLogin && (
                    <>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>What's your name?</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Alex Student"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Which course are you taking?</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. B.Tech Mechanical Engineering"
                                value={courseName}
                                onChangeText={setCourseName}
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Semester</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 4th Semester"
                                value={semester}
                                onChangeText={setSemester}
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>
                    </>
                )}

                <Pressable
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleAuth}
                    disabled={loading}
                >
                    <Text style={styles.submitBtnText}>
                        {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Create Account')}
                    </Text>
                </Pressable>

                <Pressable style={styles.toggleBtn} onPress={() => setIsLogin(!isLogin)}>
                    <Text style={styles.toggleText}>
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </Text>
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
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3748',
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
    },
    form: {
        paddingHorizontal: 25,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 16,
        color: '#2D3748',
    },
    submitBtn: {
        backgroundColor: '#805AD5',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#805AD5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    toggleBtn: {
        marginTop: 20,
        alignItems: 'center',
    },
    toggleText: {
        color: '#805AD5',
        fontWeight: '600',
        fontSize: 14,
    }
});
