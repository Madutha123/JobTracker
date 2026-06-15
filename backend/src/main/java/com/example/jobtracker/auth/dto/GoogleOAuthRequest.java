package com.example.jobtracker.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleOAuthRequest {

    @NotBlank
    private String credential;
}
