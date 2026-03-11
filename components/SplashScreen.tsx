import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    withDelay,
    runOnJS
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Props {
    onAnimationEnd: () => void;
}

export default function SplashScreen({ onAnimationEnd }: Props) {
    const logoScale = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);

    // Background gradient circles
    const circle1Scale = useSharedValue(0);
    const circle2Scale = useSharedValue(0);

    useEffect(() => {
        // 1. Pop the logo
        logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
        logoOpacity.value = withTiming(1, { duration: 800 });

        // 2. Expand background abstract circles
        circle1Scale.value = withDelay(200, withSpring(1, { damping: 20 }));
        circle2Scale.value = withDelay(400, withSpring(1, { damping: 20 }));

        // 3. Fade in text
        textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
        textTranslateY.value = withDelay(600, withSpring(0, { damping: 12 }));

        // 4. Trigger completion
        setTimeout(() => {
            onAnimationEnd();
        }, 2500);
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }]
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }]
    }));

    const circle1Style = useAnimatedStyle(() => ({
        transform: [{ scale: circle1Scale.value }]
    }));

    const circle2Style = useAnimatedStyle(() => ({
        transform: [{ scale: circle2Scale.value }]
    }));

    return (
        <View style={styles.container}>
            {/* Decorative Background */}
            <Animated.View style={[styles.circle, styles.circleOne, circle1Style]} />
            <Animated.View style={[styles.circle, styles.circleTwo, circle2Style]} />

            {/* Main Content */}
            <View style={styles.content}>
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <Sparkles size={60} color="#FFFFFF" strokeWidth={1.5} />
                </Animated.View>

                <Animated.View style={[styles.textContainer, textStyle]}>
                    <Text style={styles.title}>StudyGenie</Text>
                    <Text style={styles.subtitle}>Supercharge your learning.</Text>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FAF9F6',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.2,
    },
    circleOne: {
        width: width * 1.5,
        height: width * 1.5,
        backgroundColor: '#E9D8FD',
        top: -width * 0.5,
        left: -width * 0.2,
    },
    circleTwo: {
        width: width,
        height: width,
        backgroundColor: '#D6BCFA',
        bottom: -width * 0.3,
        right: -width * 0.2,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    logoContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#805AD5',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#805AD5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 30,
        transform: [{ rotate: '15deg' }]
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: '#322659',
        letterSpacing: -1,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#6B46C1',
        fontWeight: '500',
        letterSpacing: 0.5,
    }
});
