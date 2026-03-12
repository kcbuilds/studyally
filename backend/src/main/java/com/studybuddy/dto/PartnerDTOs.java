package com.studybuddy.dto;

import com.studybuddy.entity.PartnerRequest;
import lombok.*;
import java.time.LocalDateTime;

public class PartnerDTOs {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SendRequestDTO {
        private Long receiverId;
        private String message;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PartnerRequestResponse {
        private Long id;
        private UserDTOs.UserResponse sender;
        private UserDTOs.UserResponse receiver;
        private PartnerRequest.Status status;
        private String message;
        private LocalDateTime createdAt;
    }
}
