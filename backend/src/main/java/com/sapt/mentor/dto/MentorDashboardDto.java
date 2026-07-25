package com.sapt.mentor.dto;

import com.sapt.submission.dto.SubmissionDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorDashboardDto {
    private int totalStudents;
    private int totalCredits;
    private int approvedCount;
    private int rejectedCount;
    private int pendingCount;
    private int successRate;

    private List<MentorDto.StudentSummary> topStudents;
    private Map<String, Integer> factorCounts;
    private List<SkillTrendEntry> skillTrendData;
    private List<SubmissionDto.SubmissionResponse> recentPending;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillTrendEntry {
        private String month;
        private int achievements;
    }
}
