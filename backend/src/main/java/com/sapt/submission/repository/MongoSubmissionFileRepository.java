package com.sapt.submission.repository;

import com.sapt.submission.entity.MongoSubmissionFile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MongoSubmissionFileRepository extends MongoRepository<MongoSubmissionFile, String> {
    Optional<MongoSubmissionFile> findBySubmissionFileId(String submissionFileId);
    List<MongoSubmissionFile> findBySubmissionId(String submissionId);
    void deleteBySubmissionId(String submissionId);
}
