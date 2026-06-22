package com.example.jobtracker.application.controller;

import com.example.jobtracker.application.dto.JobApplicationRequest;
import com.example.jobtracker.application.dto.JobApplicationResponse;
import com.example.jobtracker.application.service.JobApplicationService;
import com.example.jobtracker.auth.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService applicationService;

    @PostMapping
    public ResponseEntity<JobApplicationResponse> createApplication(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.createApplication(user.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<JobApplicationResponse>> getApplications(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getApplications(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> getApplication(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplication(user.getId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> updateApplication(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(applicationService.updateApplication(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        applicationService.deleteApplication(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
