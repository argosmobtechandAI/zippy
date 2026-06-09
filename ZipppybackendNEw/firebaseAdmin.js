import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabaseClient.js';

let isFirebaseInitialized = false;

try {
    const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        if (!getApps().length) {
            initializeApp({
                credential: cert(serviceAccount)
            });
        }
        isFirebaseInitialized = true;
        console.log("🔥 Firebase Admin SDK Initialized Successfully!");
    } else {
        console.warn("⚠️ Firebase Admin SDK: 'serviceAccountKey.json' not found.");
    }
} catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
}

export const sendPushNotification = async (tokens, title, body, data = {}, imageUrl = null) => {
    if (!isFirebaseInitialized) return { success: false, message: 'Firebase not initialized' };
    if (!tokens || tokens.length === 0) return { success: false, message: 'No tokens provided' };

    const validTokens = tokens.filter(t => t);
    if (validTokens.length === 0) return { success: false, message: 'No valid tokens provided' };

    const message = {
        notification: { 
            title, 
            body,
            ...(imageUrl && { imageUrl }) // Attach image URL if provided
        },
        data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
        tokens: validTokens
    };

    try {
        const response = await getMessaging().sendEachForMulticast(message);
        console.log(`✅ Push notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error sending push notification:', error);
        return { success: false, error };
    }
};

export const sendPushToUser = async (userId, title, body, data = {}) => {
    if (!isFirebaseInitialized) return { success: false, message: 'Firebase not initialized' };
    try {
        const { data: user } = await supabase.from('users').select('fcm_token').eq('id', userId).single();
        if (user && user.fcm_token) {
            return await sendPushNotification([user.fcm_token], title, body, data);
        }
        return { success: false, message: 'User has no FCM token' };
    } catch (error) {
        console.error("Failed to send push to user:", error);
        return { success: false, error };
    }
};
