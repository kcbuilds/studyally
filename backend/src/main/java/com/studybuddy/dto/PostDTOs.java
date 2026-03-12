package com.studybuddy.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

public class PostDTOs {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreatePostRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 200)
        private String title;

        @NotBlank(message = "Content is required")
        private String content;

        @NotBlank(message = "Skill is required")
        private String skill;

        @Min(0) @Max(100)
        private Integer progressPercent = 0;

        private String imageBase64;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PostResponse {
        private Long id;
        private AuthorInfo author;
        private String title;
        private String content;
        private String skill;
        private Integer progressPercent;
        private Integer likesCount;
        private Boolean likedByMe;
        private List<CommentResponse> comments;
        private LocalDateTime createdAt;
        private String imageBase64;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CommentResponse {
        private Long id;
        private AuthorInfo author;
        private String content;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateCommentRequest {
        @NotBlank(message = "Comment cannot be empty")
        private String content;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthorInfo {
        private Long id;
        private String name;
        private String avatarColor;
        private String avatarInitials;
    }
}
