package com.sapt.mentor.controller;

import com.sapt.common.response.ApiResponse;
import com.sapt.mentor.dto.MentorDashboardDto;
import com.sapt.mentor.dto.MentorDto;
import com.sapt.mentor.service.MentorService;
import com.sapt.submission.dto.SubmissionDto;
import com.sapt.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * MentorController - REST endpoints for Mentor role.
 * Base URL: /api/mentor
 * Access: ROLE_MENTOR only
 */
@RestController
@RequestMapping("/mentor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MENTOR')")
public class MentorController {

    private final MentorService mentorService;
    private final SubmissionService submissionService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<MentorDto.MentorProfile>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(ApiResponse.success(
                "Profile fetched successfully", mentorService.getProfile(email)));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<MentorDto.StudentSummary>>> getAssignedStudents(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        String mentorId = mentorService.getProfile(email).getId();
        return ResponseEntity.ok(ApiResponse.success(
                "Assigned students fetched successfully", mentorService.getAssignedStudents(mentorId)));
     }

     @GetMapping("/students/{studentId}/submissions")
     public ResponseEntity<ApiResponse<List<SubmissionDto.SubmissionResponse>>> getStudentSubmissions(
             @PathVariable String studentId,
             @AuthenticationPrincipal UserDetails userDetails) {
         String email = userDetails.getUsername();
         String mentorId = mentorService.getProfile(email).getId();
         return ResponseEntity.ok(ApiResponse.success(
                 "Student submissions fetched successfully", 
                 mentorService.getStudentSubmissions(mentorId, studentId)));
     }

     @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<MentorDashboardDto>> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(ApiResponse.success(
                "Dashboard stats fetched successfully", mentorService.getDashboardStats(email)));
    }

    @GetMapping("/submissions/pending")
    public ResponseEntity<ApiResponse<List<SubmissionDto.SubmissionResponse>>> getPendingSubmissions(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        String mentorId = mentorService.getProfile(email).getId();
        return ResponseEntity.ok(ApiResponse.success(
                "Pending submissions fetched successfully", submissionService.getMentorPendingSubmissions(mentorId)));
    }

    @PutMapping("/submissions/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveSubmission(
            @PathVariable String id,
            @RequestBody(required = false) SubmissionDto.ReviewSubmissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        String mentorId = mentorService.getProfile(email).getId();

        SubmissionDto.ReviewSubmissionRequest reviewRequest = request;
        if (reviewRequest == null) {
            reviewRequest = new SubmissionDto.ReviewSubmissionRequest();
            reviewRequest.setReview("Approved");
        }
        reviewRequest.setStatus(com.sapt.common.enums.SubmissionStatus.APPROVED);

        SubmissionDto.SubmissionResponse sub = submissionService.getSubmissionById(id);
        boolean isCustom = sub.isCustomCategory() || (sub.getSuggestedCredits() != null && sub.getSuggestedCredits() == 0);
        if (!isCustom && sub.getSuggestedCredits() != null) {
            // For predefined categories, mentor cannot override credits - enforce predefined value from database
            reviewRequest.setCredits(sub.getSuggestedCredits());
        } else if (reviewRequest.getCredits() == null) {
            reviewRequest.setCredits(sub.getSuggestedCredits() != null ? sub.getSuggestedCredits() : 0);
        }

        submissionService.reviewSubmission(mentorId, id, reviewRequest);
        return ResponseEntity.ok(ApiResponse.success("Submission approved successfully"));
    }

    @PutMapping("/submissions/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectSubmission(
            @PathVariable String id,
            @RequestBody(required = false) SubmissionDto.ReviewSubmissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        String mentorId = mentorService.getProfile(email).getId();

        SubmissionDto.ReviewSubmissionRequest reviewRequest = request;
        if (reviewRequest == null) {
            reviewRequest = new SubmissionDto.ReviewSubmissionRequest();
            reviewRequest.setReview("Rejected");
        }
        reviewRequest.setStatus(com.sapt.common.enums.SubmissionStatus.REJECTED);
        reviewRequest.setCredits(0);

        // Compute credit penalty: ceil(suggestedCredits * 10%)
        SubmissionDto.SubmissionResponse sub = submissionService.getSubmissionById(id);
        int suggested = sub.getSuggestedCredits() != null ? sub.getSuggestedCredits() : 0;
        int penalty = (int) Math.ceil(suggested * 0.10);
        reviewRequest.setCreditPenalty(penalty);

        submissionService.reviewSubmission(mentorId, id, reviewRequest);
        return ResponseEntity.ok(ApiResponse.success("Submission rejected successfully"));
    }

    @PostMapping("/succession")
    public ResponseEntity<ApiResponse<Void>> submitSuccessionRequest(
            @RequestBody MentorDto.SuccessionSubmitRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        String mentorId = mentorService.getProfile(email).getId();
        mentorService.submitSuccessionRequest(mentorId, request);
        return ResponseEntity.ok(ApiResponse.success("Succession request submitted successfully"));
    }

    @DeleteMapping("/succession")
    public ResponseEntity<ApiResponse<Void>> cancelSuccessionRequest(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        String mentorId = mentorService.getProfile(email).getId();
        mentorService.cancelSuccessionRequest(mentorId);
        return ResponseEntity.ok(ApiResponse.success("Succession request cancelled successfully"));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<MentorDto.DailyLogResponse>>> getAssignedStudentsLogs(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        String mentorId = mentorService.getProfile(email).getId();
        return ResponseEntity.ok(ApiResponse.success(
                "Daily logs fetched successfully", mentorService.getAssignedStudentsLogs(mentorId)));
    }

    @PutMapping("/logs/{id}/remark")
    public ResponseEntity<ApiResponse<Void>> reviewLog(
            @PathVariable String id,
            @RequestBody(required = false) MentorDto.LogReviewRequest request,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String remark,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        String mentorId = mentorService.getProfile(email).getId();

        String finalStatus = "approved";
        String finalRemark = "";

        if (request != null && (request.getReviewStatus() != null || request.getReview() != null)) {
            if (request.getReviewStatus() != null) {
                finalStatus = request.getReviewStatus();
            }
            if (request.getReview() != null) {
                finalRemark = request.getReview();
            }
        } else {
            if (status != null) {
                finalStatus = status;
            }
            if (remark != null) {
                finalRemark = remark;
            }
        }

        mentorService.reviewLog(mentorId, id, finalStatus, finalRemark);
        return ResponseEntity.ok(ApiResponse.success("Daily log reviewed successfully"));
    }
}

