package com.studybuddy.service;

import com.studybuddy.dto.UserDTOs;
import com.studybuddy.entity.*;
import com.studybuddy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PartnerRequestRepository partnerRequestRepository;

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    @Transactional
    public void incrementSession(String email) {
        User user = getByEmail(email);
        user.setTotalSessions(user.getTotalSessions() + 1);
        userRepository.save(user);
    }

    @Transactional
    public void incrementSessionById(Long id) {
        User user = getById(id);
        user.setTotalSessions(user.getTotalSessions() + 1);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTOs.NearbyUserResponse> getNearbyUsers(String currentEmail) {
        User current = getByEmail(currentEmail);

        // ── GPS-based matching ───────────────────────────────────────────────
        if (current.getLatitude() != null && current.getLongitude() != null) {

            List<User> gpsNearby = userRepository.findNearbyUsers(
                    current.getLatitude(), current.getLongitude(),
                    current.getId(), 50.0
            );
            if (gpsNearby.isEmpty()) {
                gpsNearby = userRepository.findNearbyUsers(
                        current.getLatitude(), current.getLongitude(),
                        current.getId(), 200.0
                );
            }

            // Also include ALL users with NULL coords (they can't be found by haversine)
            List<User> nullCoordsInCity = userRepository.findAllWithNullCoords(current.getId());

            // Merge without duplicates
            java.util.Set<Long> seen = new java.util.HashSet<>();
            java.util.List<User> combined = new java.util.ArrayList<>(gpsNearby);
            gpsNearby.forEach(u -> seen.add(u.getId()));
            nullCoordsInCity.stream()
                    .filter(u -> !seen.contains(u.getId()))
                    .forEach(combined::add);

            if (combined.isEmpty()) {
                combined = new java.util.ArrayList<>(userRepository.findAllExcept(current.getId()));
            }

            final User me = current;
            return combined.stream()
                    .map(u -> toNearbyResponse(u, me.getId(),
                            u.getLatitude() != null && u.getLongitude() != null
                                    ? haversine(me.getLatitude(), me.getLongitude(), u.getLatitude(), u.getLongitude())
                                    : null))
                    .toList();
        }

        // ── City-based fallback (no GPS coords saved) ────────────────────────
        List<User> users = current.getCity() != null
                ? userRepository.findByCity(current.getId(), current.getCity())
                : userRepository.findAllExcept(current.getId());

        return users.stream()
                .map(u -> toNearbyResponse(u, current.getId(), null))
                .toList();
    }

    @Transactional
    public UserDTOs.UserResponse updateProfile(String email, UserDTOs.UpdateProfileRequest req) {
        User user = getByEmail(email);
        if (req.getName() != null)          user.setName(req.getName());
        if (req.getBio() != null)           user.setBio(req.getBio());
        if (req.getCity() != null)          user.setCity(req.getCity());
        if (req.getCountry() != null)       user.setCountry(req.getCountry());
        if (req.getLatitude() != null)      user.setLatitude(req.getLatitude());
        if (req.getLongitude() != null)     user.setLongitude(req.getLongitude());
        if (req.getTeachesSkills() != null) user.setTeachesSkills(req.getTeachesSkills());
        if (req.getLearnsSkills() != null)  user.setLearnsSkills(req.getLearnsSkills());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void setOnlineStatus(String email, boolean online) {
        userRepository.findByEmail(email).ifPresent(u -> {
            u.setIsOnline(online);
            userRepository.save(u);
        });
    }

    @Transactional
    public void rateUser(Long userId, int stars) {
        User user = getById(userId);
        user.setRatingSum(user.getRatingSum() + stars);
        user.setRatingCount(user.getRatingCount() + 1);
        userRepository.save(user);
    }

    // ── Haversine distance formula (returns km) ──────────────────────────────
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────

    public UserDTOs.UserResponse toResponse(User u) {
        return UserDTOs.UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .city(u.getCity())
                .country(u.getCountry())
                .bio(u.getBio())
                .avatarColor(u.getAvatarColor())
                .avatarInitials(u.getAvatarInitials())
                .isOnline(u.getIsOnline())
                .latitude(u.getLatitude())
                .longitude(u.getLongitude())
                .totalSessions(u.getTotalSessions())
                .averageRating(u.getAverageRating())
                .ratingCount(u.getRatingCount())
                .teachesSkills(u.getTeachesSkills())
                .learnsSkills(u.getLearnsSkills())
                .createdAt(u.getCreatedAt())
                .build();
    }

    private UserDTOs.NearbyUserResponse toNearbyResponse(User u, Long currentUserId, Double distanceKm) {
        Optional<PartnerRequest> req = partnerRequestRepository
                .findBySenderIdAndReceiverId(currentUserId, u.getId());
        if (req.isEmpty()) {
            req = partnerRequestRepository.findBySenderIdAndReceiverId(u.getId(), currentUserId);
        }
        String status = req.map(r -> r.getStatus().name()).orElse("NONE");

        // Round to 1 decimal place if present
        Double roundedDist = distanceKm != null
                ? Math.round(distanceKm * 10.0) / 10.0
                : null;

        return UserDTOs.NearbyUserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .city(u.getCity())
                .bio(u.getBio())
                .avatarColor(u.getAvatarColor())
                .avatarInitials(u.getAvatarInitials())
                .isOnline(u.getIsOnline())
                .averageRating(u.getAverageRating())
                .totalSessions(u.getTotalSessions())
                .teachesSkills(u.getTeachesSkills())
                .learnsSkills(u.getLearnsSkills())
                .requestStatus(status)
                .distanceKm(roundedDist)
                .build();
    }
}
