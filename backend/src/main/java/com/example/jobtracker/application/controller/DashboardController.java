package com.example.jobtracker.application.controller;

import com.example.jobtracker.application.dto.DashboardStatsResponse;
import com.example.jobtracker.application.service.DashboardService;
import com.example.jobtracker.auth.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(user.getId()));
    }
}
