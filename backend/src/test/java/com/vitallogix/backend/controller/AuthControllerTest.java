package com.vitallogix.backend.controller;

import com.vitallogix.backend.model.User;
import com.vitallogix.backend.repository.UserRepository;
import com.vitallogix.backend.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    @Test
    void registerRejectsExistingUsernameIgnoringCaseAndWhitespace() {
        UserRepository userRepository = mock(UserRepository.class);
        JwtService jwtService = mock(JwtService.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        AuthController controller = new AuthController(userRepository, jwtService, passwordEncoder);

        when(userRepository.findByNormalizedUsername(anyString())).thenReturn(Optional.of(new User()));

        ResponseEntity<?> response = controller.register(Map.of(
                "username", " Juan ",
                "password", "Secret123"
        ));

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Username already exists", response.getBody());
        verify(userRepository).findByNormalizedUsername("Juan");
        verify(userRepository, never()).save(any(User.class));
    }
}
