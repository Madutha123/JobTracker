package com.example.jobtracker.company.repository;

import com.example.jobtracker.company.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    boolean existsByNameIgnoreCase(String name);

    List<Company> findByNameContainingIgnoreCase(String query);
}
