package com.sapt.submission.entity;

import com.sapt.common.enums.SubmissionFileType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ============================================================
 * SubmissionFile — File Attachment for a Submission
 * ============================================================
 * A student can attach up to 3 files per submission:
 *   CERTIFICATE   → PDF / JPG / PNG / WEBP (proof of award)
 *   PRESENTATION  → PPT / PPTX
 *   DOCUMENT      → PDF / DOC / DOCX / XLS / XLSX
 *
 * Each file is one row linked to the parent submission.
 * All rows cascade-delete when the parent submission is deleted.
 *
 * Table: submission_files
 * ============================================================
 */
@Entity
@Table(
    name = "submission_files",
    indexes = {
        @Index(name = "idx_files_submission", columnList = "submission_id"),
        @Index(name = "idx_files_type",       columnList = "file_type")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionFile {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    /** FK → submissions.id (CASCADE DELETE) */
    @Column(name = "submission_id", nullable = false, columnDefinition = "CHAR(36)")
    private String submissionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false, length = 20)
    private SubmissionFileType fileType;

    /** Original filename as uploaded by the student */
    @Column(name = "original_filename", nullable = false, length = 500)
    private String originalFilename;

    /**
     * Server-side storage path or CDN/S3 URL.
     * Relative or absolute depending on storage backend.
     */
    @Column(name = "stored_path", nullable = false, length = 1000)
    private String storedPath;

    /** MIME type (e.g., "application/pdf", "image/jpeg") */
    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    /** File size in bytes */
    @Column(name = "file_size_bytes", nullable = false)
    @Builder.Default
    private long fileSizeBytes = 0L;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false, nullable = false)
    private LocalDateTime uploadedAt;
}
