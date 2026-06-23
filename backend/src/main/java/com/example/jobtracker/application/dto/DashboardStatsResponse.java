package com.example.jobtracker.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalApplications;
    private Map<String, Long> statusBreakdown;
    private double interviewConversionRate;
    private double offerRate;
    private List<WeeklySubmission> weeklySubmissions;
    private List<MonthlySubmission> monthlySubmissions;
    private List<YearlySubmission> yearlySubmissions;
    private List<CompanyCount> topCompanies;
    private List<String> distinctPositions;
    private Map<String, Long> positionBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklySubmission {
        private String week; // e.g., "W1", "2026-W25"
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySubmission {
        private String month; // e.g., "Jan", "Feb"
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearlySubmission {
        private String year; // e.g., "2026"
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyCount {
        private String companyName;
        private long count;
    }
}
