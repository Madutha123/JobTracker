package com.example.jobtracker.company.dto;

import com.example.jobtracker.company.model.Company;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompanyResponse {

    private Long id;
    private String name;
    private String website;
    private String industry;
    private String notes;

    public static CompanyResponse from(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .website(company.getWebsite())
                .industry(company.getIndustry())
                .notes(company.getNotes())
                .build();
    }
}
