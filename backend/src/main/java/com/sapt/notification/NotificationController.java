package com.sapt.notification;

import com.sapt.auth.repository.UserRepository;
import com.sapt.common.response.ApiResponse;
import com.sapt.notification.entity.Notification;
import com.sapt.notification.repository.NotificationRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Simple DTO to expose notification data with explicit field names */
@Data
@Builder
class NotificationDto {
    private String id;
    private String recipientId;
    private String senderId;
    private String type;
    private String title;
    private String body;
    private String referenceType;
    private String referenceId;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    static NotificationDto from(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .recipientId(n.getRecipientId())
                .senderId(n.getSenderId())
                .type(n.getType() != null ? n.getType().name() : null)
                .title(n.getTitle())
                .body(n.getBody())
                .referenceType(n.getReferenceType() != null ? n.getReferenceType().name() : null)
                .referenceId(n.getReferenceId())
                .read(n.isRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}

/**
 * ============================================================
 * NotificationController — REST endpoints for notifications
 * ============================================================
 * Base URL : /api/notifications
 * Security : Authenticated users only
 *
 * NOTE: UserDetails.getUsername() returns the user's EMAIL
 * (see CustomUserDetailsService). We resolve it to the UUID
 * via UserRepository before querying notifications.
 *
 * Endpoints:
 *   GET  /               → all notifications for logged-in user
 *   GET  /unread-count   → count of unread notifications
 *   PUT  /:id/read       → mark single notification as read
 *   PUT  /read-all       → mark all notifications as read
 * ============================================================
 */
@Slf4j
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Resolves the email from UserDetails to the user's UUID.
     * Falls back to the email string itself if user not found (edge case).
     */
    private String resolveUserId(UserDetails userDetails) {
        String email = userDetails.getUsername(); // email in SAPT
        return userRepository.findByEmail(email)
                .map(u -> u.getId())
                .orElse(email); // fallback
    }

    /**
     * GET /api/notifications
     * Returns all notifications for the currently logged-in user,
     * ordered newest-first.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getMyNotifications(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = resolveUserId(userDetails);
        List<NotificationDto> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully", notifications));
    }

    /**
     * GET /api/notifications/unread-count
     * Returns the count of unread notifications for the logged-in user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = resolveUserId(userDetails);
        long count = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().filter(n -> !n.isRead()).count();
        return ResponseEntity.ok(ApiResponse.success("Unread count fetched", Map.of("count", count)));
    }

    /**
     * PUT /api/notifications/:id/read
     * Marks a single notification as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = resolveUserId(userDetails);
        notificationRepository.findById(id).ifPresent(notif -> {
            if (notif.getRecipientId().equals(userId)) {
                notif.setRead(true);
                notif.setReadAt(LocalDateTime.now());
                notificationRepository.save(notif);
            }
        });
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    /**
     * PUT /api/notifications/read-all
     * Marks all notifications for the logged-in user as read.
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = resolveUserId(userDetails);
        List<Notification> unread = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.isRead())
                .toList();

        LocalDateTime now = LocalDateTime.now();
        unread.forEach(n -> {
            n.setRead(true);
            n.setReadAt(now);
        });
        notificationRepository.saveAll(unread);
        log.info("Marked {} notifications as read for user {}", unread.size(), userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
