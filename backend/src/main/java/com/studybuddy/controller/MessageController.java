package com.studybuddy.controller;

import com.studybuddy.dto.MessageDTOs;
import com.studybuddy.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<MessageDTOs.MessageResponse> sendMessage(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody MessageDTOs.SendMessageRequest req) {

        MessageDTOs.MessageResponse response =
            messageService.sendMessage(principal.getUsername(), req);

        // Push to receiver via WebSocket
        messagingTemplate.convertAndSendToUser(
            req.getReceiverId().toString(),
            "/queue/messages",
            response
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/conversation/{partnerId}")
    public ResponseEntity<List<MessageDTOs.MessageResponse>> getConversation(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long partnerId) {
        messageService.markRead(principal.getUsername(), partnerId);
        return ResponseEntity.ok(messageService.getConversation(principal.getUsername(), partnerId));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<MessageDTOs.ConversationSummary>> getConversations(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(messageService.getConversationList(principal.getUsername()));
    }
}
