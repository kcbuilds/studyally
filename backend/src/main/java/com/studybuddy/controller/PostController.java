package com.studybuddy.controller;

import com.studybuddy.dto.PostDTOs;
import com.studybuddy.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<PostDTOs.PostResponse>> getAllPosts(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(postService.getAllPosts(principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<PostDTOs.PostResponse> createPost(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody PostDTOs.CreatePostRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.createPost(principal.getUsername(), req));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<PostDTOs.PostResponse> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(postService.toggleLike(id, principal.getUsername()));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<PostDTOs.CommentResponse> addComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody PostDTOs.CreateCommentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.addComment(id, principal.getUsername(), req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        postService.deletePost(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}