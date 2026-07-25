package com.sapt.mentor.service;

import com.sapt.mentor.dto.MentorDashboardDto;
import com.sapt.mentor.dto.MentorDto;
import java.util.List;

public interface MentorService {

    MentorDto.MentorProfile getProfile(String authUserId);
    
    List<MentorDto.StudentSummary> getAssignedStudents(String mentorId);
    
    MentorDashboardDto getDashboardStats(String authUserId);
    
    void submitSuccessionRequest(String mentorId, MentorDto.SuccessionSubmitRequest request);
    
    void cancelSuccessionRequest(String mentorId);
    
    List<MentorDto.DailyLogResponse> getAssignedStudentsLogs(String mentorId);
    
    void reviewLog(String mentorId, String logId, String status, String remark);

    List<com.sapt.submission.dto.SubmissionDto.SubmissionResponse> getStudentSubmissions(String mentorId, String studentId);
}
