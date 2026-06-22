package com.example.jobtracker.company.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CompanyRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name must not exceed 150 characters")
    private String name;

    @Size(max = 255, message = "Website URL must not exceed 255 characters")
    private String website;

    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String industry;

    private String notes;
}
