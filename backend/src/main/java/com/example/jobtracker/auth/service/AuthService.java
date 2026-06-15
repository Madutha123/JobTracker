package com.example.jobtracker.auth.service;

import com.example.jobtracker.auth.dto.AuthResponse;
import com.example.jobtracker.auth.dto.LoginRequest;
import com.example.jobtracker.auth.dto.RegisterRequest;
import com.example.jobtracker.auth.exception.EmailAlreadyExistsException;
import com.example.jobtracker.auth.exception.UsernameAlreadyExistsException;
import com.example.jobtracker.auth.model.User;
import com.example.jobtracker.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${app.oauth.google.client-id}")
    private String googleClientId;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException(
                    "Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(
                    "Email '" + request.getEmail() + "' is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        logger.info("Registered new user '{}'", user.getUsername());

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

        logger.info("User '{}' logged in successfully", user.getUsername());

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    @SuppressWarnings("unchecked")
    public AuthResponse oauthLogin(String credential) {
        Map<String, Object> userInfo = RestClient.create()
                .get()
                .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                .header("Authorization", "Bearer " + credential)
                .retrieve()
                .body(Map.class);

        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Google account has no email");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            String base = email.substring(0, email.indexOf('@')).replaceAll("[^a-zA-Z0-9._-]", "");
            if (base.length() > 40) base = base.substring(0, 40);
            String username = base;
            String suffix = String.format("%03d", new Random().nextInt(1000));
            while (userRepository.existsByUsername(username + suffix)) {
                suffix = String.format("%03d", new Random().nextInt(1000));
            }
            username = username + suffix;

            user = User.builder()
                    .username(username)
                    .email(email)
                    .password(null)
                    .build();

            userRepository.save(user);
            logger.info("Auto-registered user '{}' via Google (email={})", user.getUsername(), email);
        } else {
            logger.info("User '{}' logged in via Google", user.getUsername());
        }

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
}
