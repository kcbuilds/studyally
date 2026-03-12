package com.studybuddy.service;

import com.studybuddy.dto.AuthDTOs;
import com.studybuddy.dto.UserDTOs;
import com.studybuddy.entity.User;
import com.studybuddy.repository.UserRepository;
import com.studybuddy.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService userService;

    private static final List<String> AVATAR_COLORS = List.of(
        "#FF6B6B","#4ECDC4","#FFB347","#C9B1FF","#6BBAFF","#FF6B9D","#7CFF6B","#FFD93D"
    );

    @Transactional
    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        String initials = buildInitials(req.getName());
        String color = AVATAR_COLORS.get(new Random().nextInt(AVATAR_COLORS.size()));

        User user = User.builder()
            .name(req.getName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .city(req.getCity())
            .country(req.getCountry())
            .bio(req.getBio())
            .avatarColor(color)
            .avatarInitials(initials)
            .teachesSkills(req.getTeachesSkills())
            .learnsSkills(req.getLearnsSkills())
            .build();

        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getEmail());
        return AuthDTOs.AuthResponse.builder()
            .token(token)
            .type("Bearer")
            .user(userService.toResponse(user))
            .build();
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtils.generateToken(user.getEmail());
        return AuthDTOs.AuthResponse.builder()
            .token(token)
            .type("Bearer")
            .user(userService.toResponse(user))
            .build();
    }

    private String buildInitials(String name) {
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        return (String.valueOf(parts[0].charAt(0)) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
}
