package com.example.jobtracker.application.dto;

import com.example.jobtracker.application.model.ApplicationStatus;
import com.example.jobtracker.application.model.JobApplication;
import com.example.jobtracker.company.dto.CompanyResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class JobApplicationResponse {

    private Long id;
    private CompanyResponse company;
    private String jobTitle;
    private String jobUrl;
    private String location;
    private LocalDate appliedDate;
    private ApplicationStatus status;
    private String salaryRange;
    private String source;
    private LocalDateTime createdAt;

    public static JobApplicationResponse from(JobApplication app) {
        return JobApplicationResponse.builder()
                .id(app.getId())
                .company(CompanyResponse.from(app.getCompany()))
                .jobTitle(app.getJobTitle())
                .jobUrl(app.getJobUrl())
                .location(app.getLocation())
                .appliedDate(app.getAppliedDate())
                .status(app.getStatus())
                .salaryRange(app.getSalaryRange())
                .source(app.getSource())
                .createdAt(app.getCreatedAt())
                .build();
    }
}
