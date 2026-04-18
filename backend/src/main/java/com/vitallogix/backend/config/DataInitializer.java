package com.vitallogix.backend.config;

import com.vitallogix.backend.model.Role;
import com.vitallogix.backend.model.User;
import com.vitallogix.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {
    @Value("${app.bootstrap.admin.username:${APP_BOOTSTRAP_ADMIN_USERNAME:admin1}}")
    private String bootstrapAdminUsername;

    @Value("${app.bootstrap.admin.password:${APP_BOOTSTRAP_ADMIN_PASSWORD:change_me_admin_password}}")
    private String bootstrapAdminPassword;

    @Value("${app.bootstrap.demo-user.enabled:${APP_BOOTSTRAP_DEMO_USER_ENABLED:true}}")
    private boolean bootstrapDemoUserEnabled;

    @Value("${app.bootstrap.demo-user.username:${APP_BOOTSTRAP_DEMO_USER_USERNAME:user1}}")
    private String bootstrapDemoUserUsername;

    @Value("${app.bootstrap.demo-user.password:${APP_BOOTSTRAP_DEMO_USER_PASSWORD:change_me_user_password}}")
    private String bootstrapDemoUserPassword;

    @Bean
    public CommandLineRunner initUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Always ensure there is at least one admin for first-time local testing.
            seedUserIfMissing(userRepository, passwordEncoder, bootstrapAdminUsername, bootstrapAdminPassword, Set.of(Role.ADMIN));

            if (bootstrapDemoUserEnabled) {
                seedUserIfMissing(userRepository, passwordEncoder, bootstrapDemoUserUsername, bootstrapDemoUserPassword, Set.of(Role.USER));
            }
        };
    }

    private void seedUserIfMissing(UserRepository userRepository, PasswordEncoder encoder, String username, String password, Set<Role> roles) {
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return;
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }

        User u = new User();
        u.setUsername(username.trim());
        u.setPassword(encoder.encode(password));
        u.setRoles(roles);
        userRepository.save(u);
    }
}
