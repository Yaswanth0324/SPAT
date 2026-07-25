package com.sapt.submission.repository;

import com.sapt.submission.entity.SubmissionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionFileRepository extends JpaRepository<SubmissionFile, String> {
    List<SubmissionFile> findBySubmissionId(String submissionId);
}
