package com.studybuddy.controller;

import com.studybuddy.dto.UserDTOs;
import com.studybuddy.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTOs.UserResponse> getMe(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(userService.toResponse(userService.getByEmail(principal.getUsername())));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTOs.UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody UserDTOs.UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateProfile(principal.getUsername(), req));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<UserDTOs.NearbyUserResponse>> getNearby(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(userService.getNearbyUsers(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTOs.UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toResponse(userService.getById(id)));
    }

    // ── Rate a user ────────────────────────────────────────────────────────
    @PostMapping("/{id}/rate")
    public ResponseEntity<Map<String, String>> rateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        int rating = body.getOrDefault("rating", 0);
        if (rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body(Map.of("message", "Rating must be 1-5"));
        }
        userService.rateUser(id, rating);
        return ResponseEntity.ok(Map.of("message", "Rating submitted"));
    }

    // ── Complete a session (increments both users) ─────────────────────────
    @PostMapping("/sessions/complete")
    public ResponseEntity<Map<String, String>> completeSession(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, Long> body) {
        Long partnerId = body.get("partnerId");
        if (partnerId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "partnerId required"));
        }
        userService.incrementSession(principal.getUsername());
        userService.incrementSessionById(partnerId);
        return ResponseEntity.ok(Map.of("message", "Session recorded"));
    }
}
