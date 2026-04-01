package com.vitallogix.backend.config;

import com.vitallogix.backend.model.Role;
import com.vitallogix.backend.model.User;
import com.vitallogix.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;

@Configuration
public class DataInitializer {
    @Bean
    public CommandLineRunner initUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Admins
            List<User> admins = List.of(
                createUser("admin1", "1admin", Set.of(Role.ADMIN), passwordEncoder),
                createUser("admin2", "2admin", Set.of(Role.ADMIN), passwordEncoder),
                createUser("admin3", "3admin", Set.of(Role.ADMIN), passwordEncoder)
            );
            // Users
            List<User> users = List.of(
                createUser("user1", "1user", Set.of(Role.USER), passwordEncoder),
                createUser("user2", "2user", Set.of(Role.USER), passwordEncoder),
                createUser("user3", "3user", Set.of(Role.USER), passwordEncoder)
            );
            // Guardar si no existen
            for (User u : admins) {
                userRepository.findByUsername(u.getUsername()).orElseGet(() -> userRepository.save(u));
            }
            for (User u : users) {
                userRepository.findByUsername(u.getUsername()).orElseGet(() -> userRepository.save(u));
            }
        };
    }

    private User createUser(String username, String password, Set<Role> roles, PasswordEncoder encoder) {
        User u = new User();
        u.setUsername(username);
        u.setPassword(encoder.encode(password));
        u.setRoles(roles);
        return u;
    }
}
