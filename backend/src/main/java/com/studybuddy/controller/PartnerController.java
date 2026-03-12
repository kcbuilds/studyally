package com.studybuddy.controller;

import com.studybuddy.dto.PartnerDTOs;
import com.studybuddy.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@RequiredArgsConstructor
public class PartnerController {

    private final PartnerService partnerService;

    @PostMapping("/requests")
    public ResponseEntity<PartnerDTOs.PartnerRequestResponse> sendRequest(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody PartnerDTOs.SendRequestDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(partnerService.sendRequest(principal.getUsername(), req));
    }

    @PutMapping("/requests/{id}/accept")
    public ResponseEntity<PartnerDTOs.PartnerRequestResponse> accept(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(partnerService.respondToRequest(id, principal.getUsername(), true));
    }

    @PutMapping("/requests/{id}/decline")
    public ResponseEntity<PartnerDTOs.PartnerRequestResponse> decline(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(partnerService.respondToRequest(id, principal.getUsername(), false));
    }

    @GetMapping("/requests/incoming")
    public ResponseEntity<List<PartnerDTOs.PartnerRequestResponse>> getIncoming(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(partnerService.getIncomingRequests(principal.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<PartnerDTOs.PartnerRequestResponse>> getMyPartners(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(partnerService.getMyPartners(principal.getUsername()));
    }
}
