package com.example.jobtracker.application.repository;

import com.example.jobtracker.application.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findAllByUserIdOrderByAppliedDateDesc(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT j FROM JobApplication j JOIN FETCH j.company WHERE j.user.id = :userId")
    List<JobApplication> findAllByUserIdWithCompany(Long userId);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);
}
