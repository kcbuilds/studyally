package com.studybuddy.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class MessageDTOs {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SendMessageRequest {
        @NotNull
        private Long receiverId;

        @NotBlank(message = "Message cannot be empty")
        @Size(max = 2000)
        private String content;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MessageResponse {
        private Long id;
        private Long senderId;
        private String senderName;
        private String senderAvatarColor;
        private String senderInitials;
        private Long receiverId;
        private String content;
        private Boolean isRead;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ConversationSummary {
        private Long partnerId;
        private String partnerName;
        private String partnerAvatarColor;
        private String partnerInitials;
        private Boolean partnerOnline;
        private String lastMessage;
        private LocalDateTime lastMessageTime;
        private Long unreadCount;
    }
}
