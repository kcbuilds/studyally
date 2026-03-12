package com.studybuddy.service;

import com.studybuddy.dto.MessageDTOs;
import com.studybuddy.entity.*;
import com.studybuddy.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;

    @Transactional
    public MessageDTOs.MessageResponse sendMessage(String senderEmail, MessageDTOs.SendMessageRequest req) {
        User sender   = userService.getByEmail(senderEmail);
        User receiver = userService.getById(req.getReceiverId());

        Message msg = Message.builder()
            .sender(sender)
            .receiver(receiver)
            .content(req.getContent())
            .build();

        return toResponse(messageRepository.save(msg));
    }

    @Transactional(readOnly = true)
    public List<MessageDTOs.MessageResponse> getConversation(String email, Long partnerId) {
        User current = userService.getByEmail(email);
        return messageRepository.findConversation(current.getId(), partnerId)
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void markRead(String receiverEmail, Long senderId) {
        User receiver = userService.getByEmail(receiverEmail);
        messageRepository.markAsRead(senderId, receiver.getId());
    }

    @Transactional(readOnly = true)
    public List<MessageDTOs.ConversationSummary> getConversationList(String email) {
        User current = userService.getByEmail(email);
        List<Long> partnerIds = messageRepository.findConversationPartnerIds(current.getId());

        return partnerIds.stream().map(partnerId -> {
            User partner = userService.getById(partnerId);
            List<Message> msgs = messageRepository.findConversation(current.getId(), partnerId);
            Message last = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1);

            long unread = msgs.stream()
                .filter(m -> m.getReceiver().getId().equals(current.getId()) && !m.getIsRead())
                .count();

            return MessageDTOs.ConversationSummary.builder()
                .partnerId(partnerId)
                .partnerName(partner.getName())
                .partnerAvatarColor(partner.getAvatarColor())
                .partnerInitials(partner.getAvatarInitials())
                .partnerOnline(partner.getIsOnline())
                .lastMessage(last != null ? last.getContent() : "")
                .lastMessageTime(last != null ? last.getCreatedAt() : null)
                .unreadCount(unread)
                .build();
        }).toList();
    }

    private MessageDTOs.MessageResponse toResponse(Message m) {
        return MessageDTOs.MessageResponse.builder()
            .id(m.getId())
            .senderId(m.getSender().getId())
            .senderName(m.getSender().getName())
            .senderAvatarColor(m.getSender().getAvatarColor())
            .senderInitials(m.getSender().getAvatarInitials())
            .receiverId(m.getReceiver().getId())
            .content(m.getContent())
            .isRead(m.getIsRead())
            .createdAt(m.getCreatedAt())
            .build();
    }
}
