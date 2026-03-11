import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import SplashScreen from '../components/SplashScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { useUserStore } from '../store/useUserStore';
import { doc, getDoc } from 'firebase/firestore';
import { useRoutineStore } from '../store/useRoutineStore';
import { usePlannerStore } from '../store/usePlannerStore';

export default function IndexScreen() {
    const [showSplash, setShowSplash] = useState(true);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const setProfile = useUserStore(state => state.setProfile);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch profile data from Firestore to hydrate local zustand store
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setProfile({
                            name: data.name,
                            semester: data.semester,
                            courseName: data.courseName
                        });
                    }

                } catch (e) {
                    console.error("Error fetching user profile:", e);
                }

                // Trigger the real-time sync for Routines and Tasks consistently
                useRoutineStore.getState().syncClasses(user.uid);
                usePlannerStore.getState().syncTasks(user.uid);
                setIsAuthenticated(true);
            } else {
                useRoutineStore.getState().clearLocalData();
                usePlannerStore.getState().clearLocalData();
                setIsAuthenticated(false);
            }
            setIsAuthChecking(false);
        });

        return () => unsubscribe();
    }, []);

    if (showSplash) {
        return <SplashScreen onAnimationEnd={() => setShowSplash(false)} />;
    }

    if (isAuthChecking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#805AD5" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)/dashboard" />;
}
