package com.example.jobtracker.attachment.controller;

import com.example.jobtracker.attachment.dto.AttachmentResponse;
import com.example.jobtracker.attachment.model.FileType;
import com.example.jobtracker.attachment.service.AttachmentService;
import com.example.jobtracker.auth.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications/{applicationId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @AuthenticationPrincipal User user,
            @PathVariable Long applicationId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "fileType", defaultValue = "OTHER") FileType fileType) throws Exception {
        AttachmentResponse response = attachmentService.uploadAttachment(user.getId(), applicationId, file, fileType);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AttachmentResponse>> getAttachments(
            @AuthenticationPrincipal User user,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(attachmentService.getAttachments(user.getId(), applicationId));
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @AuthenticationPrincipal User user,
            @PathVariable Long applicationId,
            @PathVariable Long attachmentId) throws Exception {
        attachmentService.deleteAttachment(user.getId(), attachmentId);
        return ResponseEntity.noContent().build();
    }
}
