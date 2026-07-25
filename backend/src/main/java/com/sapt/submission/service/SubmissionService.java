package com.sapt.submission.service;

import com.sapt.submission.dto.SubmissionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SubmissionService {

    SubmissionDto.SubmissionResponse createSubmission(String studentId, SubmissionDto.CreateSubmissionRequest request);
    
    SubmissionDto.SubmissionResponse getSubmissionById(String submissionId);
    
    Page<SubmissionDto.SubmissionResponse> getStudentSubmissions(String studentId, Pageable pageable);
    
    List<SubmissionDto.SubmissionResponse> getMentorPendingSubmissions(String mentorId);
    
    Page<SubmissionDto.SubmissionResponse> getMentorPendingSubmissions(String mentorId, Pageable pageable);
    
    void reviewSubmission(String reviewerId, String submissionId, SubmissionDto.ReviewSubmissionRequest request);
    
    void withdrawSubmission(String studentId, String submissionId);

    SubmissionDto.FileDownloadResponse downloadFile(String path);
}
