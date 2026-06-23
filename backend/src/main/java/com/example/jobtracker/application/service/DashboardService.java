package com.example.jobtracker.application.service;

import com.example.jobtracker.application.dto.DashboardStatsResponse;
import com.example.jobtracker.application.model.ApplicationStatus;
import com.example.jobtracker.application.model.JobApplication;
import com.example.jobtracker.application.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final JobApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long userId) {
        List<JobApplication> applications = applicationRepository.findAllByUserIdWithCompany(userId);

        long totalApplications = applications.size();

        // 1. Status breakdown
        Map<String, Long> statusBreakdown = applications.stream()
                .collect(Collectors.groupingBy(app -> app.getStatus().name(), Collectors.counting()));

        // Ensure all statuses have at least 0 count to avoid missing keys on frontend
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusBreakdown.putIfAbsent(status.name(), 0L);
        }

        // 2. Interview conversion rate
        // Reached interview stage if status is INTERVIEW_SCHEDULED, INTERVIEWED, or OFFER
        long interviewStageCount = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED 
                            || app.getStatus() == ApplicationStatus.INTERVIEWED 
                            || app.getStatus() == ApplicationStatus.OFFER)
                .count();
        double interviewConversionRate = totalApplications > 0 
                ? ((double) interviewStageCount / totalApplications) * 100 
                : 0.0;

        // 3. Offer rate
        long offerCount = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.OFFER)
                .count();
        double offerRate = totalApplications > 0 
                ? ((double) offerCount / totalApplications) * 100 
                : 0.0;

        // 4. Weekly submissions (Current week, Monday to Sunday)
        LocalDate now = LocalDate.now();
        LocalDate currentWeekMonday = now.minusDays(now.getDayOfWeek().getValue() - 1);
        List<DashboardStatsResponse.WeeklySubmission> weeklySubmissions = new ArrayList<>();
        String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        for (int i = 0; i < 7; i++) {
            LocalDate day = currentWeekMonday.plusDays(i);
            long count = applications.stream()
                    .filter(app -> app.getAppliedDate() != null && app.getAppliedDate().isEqual(day))
                    .count();
            weeklySubmissions.add(new DashboardStatsResponse.WeeklySubmission(dayNames[i], count));
        }

        // 4b. Monthly submissions (Last 6 months)
        List<DashboardStatsResponse.MonthlySubmission> monthlySubmissions = new ArrayList<>();
        LocalDate currentMonthStart = now.withDayOfMonth(1);
        for (int i = 5; i >= 0; i--) {
            LocalDate startOfMonth = currentMonthStart.minusMonths(i);
            LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);
            long count = applications.stream()
                    .filter(app -> app.getAppliedDate() != null 
                                && !app.getAppliedDate().isBefore(startOfMonth) 
                                && !app.getAppliedDate().isAfter(endOfMonth))
                    .count();
            String label = startOfMonth.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH) + " " + String.valueOf(startOfMonth.getYear()).substring(2);
            monthlySubmissions.add(new DashboardStatsResponse.MonthlySubmission(label, count));
        }

        // 4c. Yearly submissions (Last 4 years)
        List<DashboardStatsResponse.YearlySubmission> yearlySubmissions = new ArrayList<>();
        int currentYear = now.getYear();
        for (int i = 3; i >= 0; i--) {
            int year = currentYear - i;
            long count = applications.stream()
                    .filter(app -> app.getAppliedDate() != null && app.getAppliedDate().getYear() == year)
                    .count();
            yearlySubmissions.add(new DashboardStatsResponse.YearlySubmission(String.valueOf(year), count));
        }

        // 5. Top companies
        Map<String, Long> companyCounts = applications.stream()
                .filter(app -> app.getCompany() != null)
                .collect(Collectors.groupingBy(app -> app.getCompany().getName(), Collectors.counting()));

        List<DashboardStatsResponse.CompanyCount> topCompanies = companyCounts.entrySet().stream()
                .map(entry -> new DashboardStatsResponse.CompanyCount(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparingLong(DashboardStatsResponse.CompanyCount::getCount).reversed())
                .limit(5)
                .toList();
        // 6. Distinct positions and breakdown
        Map<String, Long> positionBreakdown = applications.stream()
                .map(JobApplication::getJobTitle)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(title -> !title.isEmpty())
                .collect(Collectors.groupingBy(title -> title, Collectors.counting()));

        List<String> distinctPositions = positionBreakdown.keySet().stream()
                .sorted()
                .toList();

        return DashboardStatsResponse.builder()
                .totalApplications(totalApplications)
                .statusBreakdown(statusBreakdown)
                .interviewConversionRate(interviewConversionRate)
                .offerRate(offerRate)
                .weeklySubmissions(weeklySubmissions)
                .monthlySubmissions(monthlySubmissions)
                .yearlySubmissions(yearlySubmissions)
                .topCompanies(topCompanies)
                .distinctPositions(distinctPositions)
                .positionBreakdown(positionBreakdown)
                .build();
    }
}
