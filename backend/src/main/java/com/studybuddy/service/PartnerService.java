package com.studybuddy.service;

import com.studybuddy.dto.PartnerDTOs;
import com.studybuddy.entity.*;
import com.studybuddy.repository.PartnerRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PartnerService {

    private final PartnerRequestRepository partnerRequestRepository;
    private final UserService userService;

    @Transactional
    public PartnerDTOs.PartnerRequestResponse sendRequest(String senderEmail, PartnerDTOs.SendRequestDTO req) {
        User sender   = userService.getByEmail(senderEmail);
        User receiver = userService.getById(req.getReceiverId());

        // Block if request already exists in either direction
        if (partnerRequestRepository.existsBySenderIdAndReceiverId(sender.getId(), receiver.getId()) ||
            partnerRequestRepository.existsBySenderIdAndReceiverId(receiver.getId(), sender.getId())) {
            throw new RuntimeException("Partner request already exists");
        }

        PartnerRequest pr = PartnerRequest.builder()
            .sender(sender)
            .receiver(receiver)
            .message(req.getMessage())
            .build();

        return toResponse(partnerRequestRepository.save(pr));
    }

    @Transactional
    public PartnerDTOs.PartnerRequestResponse respondToRequest(Long requestId, String receiverEmail, boolean accept) {
        PartnerRequest pr = partnerRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!pr.getReceiver().getEmail().equals(receiverEmail)) {
            throw new RuntimeException("Not authorized");
        }

        pr.setStatus(accept ? PartnerRequest.Status.ACCEPTED : PartnerRequest.Status.DECLINED);
        return toResponse(partnerRequestRepository.save(pr));
    }

    @Transactional(readOnly = true)
    public List<PartnerDTOs.PartnerRequestResponse> getIncomingRequests(String email) {
        User user = userService.getByEmail(email);
        return partnerRequestRepository
            .findByReceiverIdAndStatus(user.getId(), PartnerRequest.Status.PENDING)
            .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PartnerDTOs.PartnerRequestResponse> getMyPartners(String email) {
        User user = userService.getByEmail(email);
        return partnerRequestRepository
            .findAcceptedPartnersByUserId(user.getId())
            .stream().map(this::toResponse).toList();
    }

    private PartnerDTOs.PartnerRequestResponse toResponse(PartnerRequest pr) {
        return PartnerDTOs.PartnerRequestResponse.builder()
            .id(pr.getId())
            .sender(userService.toResponse(pr.getSender()))
            .receiver(userService.toResponse(pr.getReceiver()))
            .status(pr.getStatus())
            .message(pr.getMessage())
            .createdAt(pr.getCreatedAt())
            .build();
    }
}
