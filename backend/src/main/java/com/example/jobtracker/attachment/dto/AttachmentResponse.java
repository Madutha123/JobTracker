package com.example.jobtracker.attachment.dto;

import com.example.jobtracker.attachment.model.ApplicationAttachment;
import com.example.jobtracker.attachment.model.FileType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AttachmentResponse {

    private Long id;
    private Long applicationId;
    private FileType fileType;
    private String cloudinaryUrl;
    private String cloudinaryPublicId;
    private LocalDateTime uploadedAt;

    public static AttachmentResponse from(ApplicationAttachment attachment) {
        return AttachmentResponse.builder()
                .id(attachment.getId())
                .applicationId(attachment.getApplication().getId())
                .fileType(attachment.getFileType())
                .cloudinaryUrl(attachment.getCloudinaryUrl())
                .cloudinaryPublicId(attachment.getCloudinaryPublicId())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }
}
