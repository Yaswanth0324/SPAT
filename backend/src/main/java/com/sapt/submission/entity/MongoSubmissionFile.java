package com.sapt.submission.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoSubmissionFile - MongoDB Document to store file contents as Base64.
 * Scoped under collection: submission_files
 */
@Document(collection = "submission_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MongoSubmissionFile {

    @Id
    private String id;

    /** Reference to SQL submission_files.id */
    private String submissionFileId;

    /** Reference to SQL submissions.id */
    private String submissionId;

    /** CERTIFICATE, PRESENTATION, or DOCUMENT */
    private String fileType;

    private String originalFilename;

    private String mimeType;

    private long fileSizeBytes;

    /** Base64 encoded file contents */
    private String base64Data;

    private LocalDateTime uploadedAt;
}
