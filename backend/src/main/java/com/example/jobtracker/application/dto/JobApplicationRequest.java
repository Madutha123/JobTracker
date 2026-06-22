package com.example.jobtracker.application.dto;

import com.example.jobtracker.application.model.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class JobApplicationRequest {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotBlank(message = "Job title is required")
    @Size(max = 150, message = "Job title must not exceed 150 characters")
    private String jobTitle;

    @Size(max = 500, message = "Job URL must not exceed 500 characters")
    private String jobUrl;

    @Size(max = 150, message = "Location must not exceed 150 characters")
    private String location;

    private LocalDate appliedDate;

    private ApplicationStatus status;

    @Size(max = 50, message = "Salary range must not exceed 50 characters")
    private String salaryRange;

    @Size(max = 100, message = "Source must not exceed 100 characters")
    private String source;
}
