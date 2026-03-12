package com.studybuddy.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

public class UserDTOs {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private String city;
        private String country;
        private String bio;
        private String avatarColor;
        private String avatarInitials;
        private Boolean isOnline;
        private Double latitude;
        private Double longitude;
        private Integer totalSessions;
        private Double averageRating;
        private Integer ratingCount;
        private Set<String> teachesSkills;
        private Set<String> learnsSkills;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String name;
        private String bio;
        private String city;
        private String country;
        private Double latitude;
        private Double longitude;
        private Set<String> teachesSkills;
        private Set<String> learnsSkills;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NearbyUserResponse {
        private Long id;
        private String name;
        private String city;
        private String bio;
        private String avatarColor;
        private String avatarInitials;
        private Boolean isOnline;
        private Double averageRating;
        private Integer totalSessions;
        private Set<String> teachesSkills;
        private Set<String> learnsSkills;
        private String requestStatus; // NONE, PENDING, ACCEPTED, DECLINED
        private Double distanceKm;
    }
}
