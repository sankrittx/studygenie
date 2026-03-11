import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermissions() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#805AD5',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

export async function scheduleClassReminder(subjectName: string, startTime: string, day: number) {
    // Simplistic setup: just demonstrating the notification capability
    // In a real app we'd convert the day/time to a concrete future Date

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Class Reminder 📚',
            body: `${subjectName} class starts at ${startTime}.`,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 5, // For MVP demo purposes, triggers in 5s
            repeats: false,
        },
    });
}

export async function scheduleMorningSummary(classCount: number) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Good Morning! ☀️',
            body: `Today you have ${classCount} classes and a StudyGenie session.`,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 10, // For MVP demo purposes, triggers in 10s
            repeats: false,
        },
    });
}
