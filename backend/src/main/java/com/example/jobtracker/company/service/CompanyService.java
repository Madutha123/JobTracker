package com.example.jobtracker.company.service;

import com.example.jobtracker.company.dto.CompanyRequest;
import com.example.jobtracker.company.dto.CompanyResponse;
import com.example.jobtracker.company.model.Company;
import com.example.jobtracker.company.repository.CompanyRepository;
import com.example.jobtracker.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private static final Logger logger = LoggerFactory.getLogger(CompanyService.class);

    private final CompanyRepository companyRepository;

    @Transactional
    public CompanyResponse createCompany(CompanyRequest request) {
        Company company = Company.builder()
                .name(request.getName())
                .website(request.getWebsite())
                .industry(request.getIndustry())
                .notes(request.getNotes())
                .build();
        Company saved = companyRepository.save(company);
        logger.info("Created company '{}' with id={}", saved.getName(), saved.getId());
        return CompanyResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(CompanyResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse getCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", id));
        return CompanyResponse.from(company);
    }

    @Transactional
    public CompanyResponse updateCompany(Long id, CompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", id));
        company.setName(request.getName());
        company.setWebsite(request.getWebsite());
        company.setIndustry(request.getIndustry());
        company.setNotes(request.getNotes());
        Company updated = companyRepository.save(company);
        logger.info("Updated company id={}", id);
        return CompanyResponse.from(updated);
    }

    @Transactional
    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company", id);
        }
        companyRepository.deleteById(id);
        logger.info("Deleted company id={}", id);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> searchCompanies(String query) {
        return companyRepository.findByNameContainingIgnoreCase(query).stream()
                .map(CompanyResponse::from)
                .toList();
    }
}
