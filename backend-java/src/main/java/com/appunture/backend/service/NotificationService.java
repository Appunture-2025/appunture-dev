package com.appunture.backend.service;

import com.google.firebase.messaging.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Service for sending push notifications via Firebase Cloud Messaging (FCM).
 * Supports sending to single devices, multiple devices, and topics.
 */
@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    /**
     * Sends a notification to a single device.
     *
     * @param fcmToken Device FCM token
     * @param title    Notification title
     * @param body     Notification body
     * @param data     Additional data payload (optional)
     * @return Message ID from FCM
     * @throws FirebaseMessagingException if sending fails
     */
    public String sendToDevice(String fcmToken, String title, String body, Map<String, String> data)
            throws FirebaseMessagingException {

        Message.Builder messageBuilder = Message.builder()
                .setToken(fcmToken)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .setAndroidConfig(AndroidConfig.builder()
                        .setPriority(AndroidConfig.Priority.HIGH)
                        .setNotification(AndroidNotification.builder()
                                .setIcon("ic_notification")
                                .setColor("#6366f1")
                                .setDefaultSound(true)
                                .build())
                        .build())
                .setApnsConfig(ApnsConfig.builder()
                        .setAps(Aps.builder()
                                .setBadge(1)
                                .setSound("default")
                                .build())
                        .build());

        if (data != null && !data.isEmpty()) {
            messageBuilder.putAllData(data);
        }

        Message message = messageBuilder.build();
        String response = FirebaseMessaging.getInstance().send(message);
        logger.info("Notification sent successfully to device: {}", response);
        return response;
    }

    /**
     * Sends a notification to multiple devices.
     *
     * @param fcmTokens List of device FCM tokens
     * @param title     Notification title
     * @param body      Notification body
     * @param data      Additional data payload (optional)
     * @return BatchResponse with success/failure counts
     * @throws FirebaseMessagingException if sending fails
     */
    public BatchResponse sendToMultipleDevices(List<String> fcmTokens, String title, String body,
            Map<String, String> data) throws FirebaseMessagingException {

        if (fcmTokens == null || fcmTokens.isEmpty()) {
            throw new IllegalArgumentException("FCM tokens list cannot be empty");
        }

        MulticastMessage.Builder messageBuilder = MulticastMessage.builder()
                .addAllTokens(fcmTokens)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build());

        if (data != null && !data.isEmpty()) {
            messageBuilder.putAllData(data);
        }

        MulticastMessage message = messageBuilder.build();
        BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);

        logger.info("Notifications sent: {} success, {} failure",
                response.getSuccessCount(), response.getFailureCount());

        // Log failed tokens for cleanup
        if (response.getFailureCount() > 0) {
            List<SendResponse> responses = response.getResponses();
            for (int i = 0; i < responses.size(); i++) {
                if (!responses.get(i).isSuccessful()) {
                    logger.warn("Failed to send to token {}: {}",
                            fcmTokens.get(i),
                            responses.get(i).getException().getMessage());
                }
            }
        }

        return response;
    }

    /**
     * Sends a notification to all devices subscribed to a topic.
     *
     * @param topic Topic name
     * @param title Notification title
     * @param body  Notification body
     * @param data  Additional data payload (optional)
     * @return Message ID from FCM
     * @throws FirebaseMessagingException if sending fails
     */
    public String sendToTopic(String topic, String title, String body, Map<String, String> data)
            throws FirebaseMessagingException {

        Message.Builder messageBuilder = Message.builder()
                .setTopic(topic)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build());

        if (data != null && !data.isEmpty()) {
            messageBuilder.putAllData(data);
        }

        Message message = messageBuilder.build();
        String response = FirebaseMessaging.getInstance().send(message);
        logger.info("Notification sent to topic '{}': {}", topic, response);
        return response;
    }

    /**
     * Subscribes devices to a topic.
     *
     * @param tokens List of FCM tokens
     * @param topic  Topic name
     * @return TopicManagementResponse with success/failure counts
     * @throws FirebaseMessagingException if subscription fails
     */
    public TopicManagementResponse subscribeToTopic(List<String> tokens, String topic)
            throws FirebaseMessagingException {
        
        TopicManagementResponse response = FirebaseMessaging.getInstance()
                .subscribeToTopic(tokens, topic);
        
        logger.info("Subscribed {} devices to topic '{}', {} failures",
                response.getSuccessCount(), topic, response.getFailureCount());
        
        return response;
    }

    /**
     * Unsubscribes devices from a topic.
     *
     * @param tokens List of FCM tokens
     * @param topic  Topic name
     * @return TopicManagementResponse with success/failure counts
     * @throws FirebaseMessagingException if unsubscription fails
     */
    public TopicManagementResponse unsubscribeFromTopic(List<String> tokens, String topic)
            throws FirebaseMessagingException {
        
        TopicManagementResponse response = FirebaseMessaging.getInstance()
                .unsubscribeFromTopic(tokens, topic);
        
        logger.info("Unsubscribed {} devices from topic '{}', {} failures",
                response.getSuccessCount(), topic, response.getFailureCount());
        
        return response;
    }

    /**
     * Sends a data-only message (no visible notification).
     * Useful for background sync triggers.
     *
     * @param fcmToken Device FCM token
     * @param data     Data payload
     * @return Message ID from FCM
     * @throws FirebaseMessagingException if sending fails
     */
    public String sendDataMessage(String fcmToken, Map<String, String> data)
            throws FirebaseMessagingException {

        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Data payload cannot be empty for data-only messages");
        }

        Message message = Message.builder()
                .setToken(fcmToken)
                .putAllData(data)
                .build();

        String response = FirebaseMessaging.getInstance().send(message);
        logger.info("Data message sent successfully: {}", response);
        return response;
    }
}
