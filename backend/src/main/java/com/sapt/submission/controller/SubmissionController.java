package com.sapt.submission.controller;

import com.sapt.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * SubmissionController - REST endpoints for Submission module.
 * Base URL: /api/submission
 * Access: Multiple roles (Student, Mentor, HOD) — use @PreAuthorize per endpoint.
 * TODO (Submission Team): Add endpoints for CRUD and review workflow.
 */
@RestController
@RequestMapping("/submission")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @org.springframework.web.bind.annotation.GetMapping("/files/download")
    public org.springframework.http.ResponseEntity<byte[]> downloadFile(
            @org.springframework.web.bind.annotation.RequestParam String path) {
        com.sapt.submission.dto.SubmissionDto.FileDownloadResponse fileRes = submissionService.downloadFile(path);
        
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileRes.getFilename() + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(fileRes.getContentType()))
                .body(fileRes.getContent());
    }
}

