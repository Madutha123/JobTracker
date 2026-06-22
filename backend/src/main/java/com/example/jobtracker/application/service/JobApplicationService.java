package com.example.jobtracker.application.service;

import com.example.jobtracker.application.dto.JobApplicationRequest;
import com.example.jobtracker.application.dto.JobApplicationResponse;
import com.example.jobtracker.application.model.ApplicationStatus;
import com.example.jobtracker.application.model.JobApplication;
import com.example.jobtracker.application.repository.JobApplicationRepository;
import com.example.jobtracker.auth.model.User;
import com.example.jobtracker.auth.repository.UserRepository;
import com.example.jobtracker.company.model.Company;
import com.example.jobtracker.company.repository.CompanyRepository;
import com.example.jobtracker.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private static final Logger logger = LoggerFactory.getLogger(JobApplicationService.class);

    private final JobApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public JobApplicationResponse createApplication(Long userId, JobApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", request.getCompanyId()));

        JobApplication application = JobApplication.builder()
                .user(user)
                .company(company)
                .jobTitle(request.getJobTitle())
                .jobUrl(request.getJobUrl())
                .location(request.getLocation())
                .appliedDate(request.getAppliedDate() != null ? request.getAppliedDate() : LocalDate.now())
                .status(request.getStatus() != null ? request.getStatus() : ApplicationStatus.APPLIED)
                .salaryRange(request.getSalaryRange())
                .source(request.getSource())
                .build();

        JobApplication saved = applicationRepository.save(application);
        logger.info("Created job application id={} for user id={}", saved.getId(), userId);
        return JobApplicationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplications(Long userId) {
        return applicationRepository.findAllByUserIdOrderByAppliedDateDesc(userId).stream()
                .map(JobApplicationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse getApplication(Long userId, Long applicationId) {
        JobApplication application = applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", applicationId));
        return JobApplicationResponse.from(application);
    }

    @Transactional
    public JobApplicationResponse updateApplication(Long userId, Long applicationId, JobApplicationRequest request) {
        JobApplication application = applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", applicationId));

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", request.getCompanyId()));

        application.setCompany(company);
        application.setJobTitle(request.getJobTitle());
        application.setJobUrl(request.getJobUrl());
        application.setLocation(request.getLocation());
        if (request.getAppliedDate() != null) application.setAppliedDate(request.getAppliedDate());
        if (request.getStatus() != null) application.setStatus(request.getStatus());
        application.setSalaryRange(request.getSalaryRange());
        application.setSource(request.getSource());

        JobApplication updated = applicationRepository.save(application);
        logger.info("Updated job application id={} for user id={}", applicationId, userId);
        return JobApplicationResponse.from(updated);
    }

    @Transactional
    public void deleteApplication(Long userId, Long applicationId) {
        if (!applicationRepository.existsByIdAndUserId(applicationId, userId)) {
            throw new ResourceNotFoundException("JobApplication", applicationId);
        }
        applicationRepository.deleteById(applicationId);
        logger.info("Deleted job application id={} for user id={}", applicationId, userId);
    }
}
