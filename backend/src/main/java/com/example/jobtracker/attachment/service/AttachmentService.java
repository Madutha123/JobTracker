package com.example.jobtracker.attachment.service;

import com.cloudinary.Cloudinary;
import com.example.jobtracker.application.model.JobApplication;
import com.example.jobtracker.application.repository.JobApplicationRepository;
import com.example.jobtracker.attachment.dto.AttachmentResponse;
import com.example.jobtracker.attachment.model.ApplicationAttachment;
import com.example.jobtracker.attachment.model.FileType;
import com.example.jobtracker.attachment.repository.AttachmentRepository;
import com.example.jobtracker.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private static final Logger logger = LoggerFactory.getLogger(AttachmentService.class);

    private final AttachmentRepository attachmentRepository;
    private final JobApplicationRepository applicationRepository;
    private final Cloudinary cloudinary;

    @Transactional
    public AttachmentResponse uploadAttachment(Long userId, Long applicationId,
                                               MultipartFile file, FileType fileType) throws IOException {
        // Verify application belongs to the calling user
        JobApplication application = applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", applicationId));

        // Upload to Cloudinary under a user-scoped folder
        String folder = "jobtracker/user_" + userId + "/application_" + applicationId;

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                Map.of(
                        "folder", folder,
                        "resource_type", "auto"
                )
        );

        String cloudinaryUrl      = (String) uploadResult.get("secure_url");
        String cloudinaryPublicId = (String) uploadResult.get("public_id");

        ApplicationAttachment attachment = ApplicationAttachment.builder()
                .application(application)
                .fileType(fileType)
                .cloudinaryUrl(cloudinaryUrl)
                .cloudinaryPublicId(cloudinaryPublicId)
                .build();

        ApplicationAttachment saved = attachmentRepository.save(attachment);
        logger.info("Uploaded attachment id={} for application id={}, user id={}", saved.getId(), applicationId, userId);
        return AttachmentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachments(Long userId, Long applicationId) {
        // Verify application belongs to the calling user
        if (!applicationRepository.existsByIdAndUserId(applicationId, userId)) {
            throw new ResourceNotFoundException("JobApplication", applicationId);
        }
        return attachmentRepository.findAllByApplicationId(applicationId).stream()
                .map(AttachmentResponse::from)
                .toList();
    }

    @Transactional
    public void deleteAttachment(Long userId, Long attachmentId) throws Exception {
        ApplicationAttachment attachment = attachmentRepository
                .findByIdAndApplication_UserId(attachmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", attachmentId));

        // Remove from Cloudinary
        cloudinary.api().deleteResources(
                List.of(attachment.getCloudinaryPublicId()),
                Map.of("resource_type", "raw")
        );

        attachmentRepository.delete(attachment);
        logger.info("Deleted attachment id={} (public_id={}) for user id={}", attachmentId, attachment.getCloudinaryPublicId(), userId);
    }
}
