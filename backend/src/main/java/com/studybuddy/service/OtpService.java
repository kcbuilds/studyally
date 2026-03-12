package com.studybuddy.service;

import org.springframework.mail.SimpleMailMessage;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

    @Service
    @RequiredArgsConstructor
    public class OtpService {

        private final JavaMailSender mailSender;
        private final Map<String, String> otpStore = new ConcurrentHashMap<>();

        public void sendOtp(String email) {
            String otp = String.format("%06d", new Random().nextInt(999999));
            otpStore.put(email, otp);

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject("StudyBuddy — Verify your email");
            msg.setText("Your OTP is: " + otp + "\n\nThis code expires when you close the app.");
            mailSender.send(msg);
        }

        public boolean verifyOtp(String email, String otp) {
            String stored = otpStore.get(email);
            if (stored != null && stored.equals(otp)) {
                otpStore.remove(email);
                return true;
            }
            return false;
        }
    }

