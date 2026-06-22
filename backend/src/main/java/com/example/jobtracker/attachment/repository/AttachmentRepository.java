package com.example.jobtracker.attachment.repository;

import com.example.jobtracker.attachment.model.ApplicationAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttachmentRepository extends JpaRepository<ApplicationAttachment, Long> {

    List<ApplicationAttachment> findAllByApplicationId(Long applicationId);

    Optional<ApplicationAttachment> findByIdAndApplication_UserId(Long id, Long userId);
}
