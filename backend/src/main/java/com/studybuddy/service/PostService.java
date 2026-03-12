package com.studybuddy.service;

import com.studybuddy.dto.PostDTOs;
import com.studybuddy.entity.*;
import com.studybuddy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<PostDTOs.PostResponse> getAllPosts(String currentEmail) {
        User current = userService.getByEmail(currentEmail);
        return postRepository.findAllByOrderByCreatedAtDesc()
            .stream().map(p -> toResponse(p, current.getId())).toList();
    }

    @Transactional
    public PostDTOs.PostResponse createPost(String email, PostDTOs.CreatePostRequest req) {
        User author = userService.getByEmail(email);
        Post post = Post.builder()
            .author(author)
            .title(req.getTitle())
            .content(req.getContent())
            .skill(req.getSkill())
            .progressPercent(req.getProgressPercent())
            .build();
        post.setImageBase64(req.getImageBase64());
        return toResponse(postRepository.save(post), author.getId());
    }

    @Transactional
    public PostDTOs.PostResponse toggleLike(Long postId, String email) {
        User user = userService.getByEmail(email);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getLikedByUserIds().contains(user.getId())) {
            post.getLikedByUserIds().remove(user.getId());
        } else {
            post.getLikedByUserIds().add(user.getId());
        }

        // Always calculate from the set — never trust the counter
        post.setLikesCount(post.getLikedByUserIds().size());

        Post saved = postRepository.save(post);
        return toResponse(saved, user.getId());
    }


    @Transactional
    public PostDTOs.CommentResponse addComment(Long postId, String email, PostDTOs.CreateCommentRequest req) {
        User author = userService.getByEmail(email);
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = Comment.builder()
            .post(post).author(author).content(req.getContent()).build();
        comment = commentRepository.save(comment);
        return toCommentResponse(comment);
    }

    @Transactional
    public void deletePost(Long postId, String email) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getAuthor().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized");
        }
        postRepository.delete(post);
    }

    public PostDTOs.PostResponse toResponse(Post p, Long currentUserId) {
        return PostDTOs.PostResponse.builder()
            .id(p.getId())
            .author(toAuthorInfo(p.getAuthor()))
            .title(p.getTitle())
            .content(p.getContent())
            .skill(p.getSkill())
            .imageBase64(p.getImageBase64())
            .progressPercent(p.getProgressPercent())
            .likesCount(p.getLikesCount())
            .likedByMe(p.getLikedByUserIds().contains(currentUserId))
            .comments(p.getComments().stream().map(this::toCommentResponse).toList())
            .createdAt(p.getCreatedAt())
            .build();

    }

    private PostDTOs.CommentResponse toCommentResponse(Comment c) {
        return PostDTOs.CommentResponse.builder()
            .id(c.getId())
            .author(toAuthorInfo(c.getAuthor()))
            .content(c.getContent())
            .createdAt(c.getCreatedAt())
            .build();
    }

    private PostDTOs.AuthorInfo toAuthorInfo(User u) {
        return PostDTOs.AuthorInfo.builder()
            .id(u.getId())
            .name(u.getName())
            .avatarColor(u.getAvatarColor())
            .avatarInitials(u.getAvatarInitials())
            .build();
    }
}
