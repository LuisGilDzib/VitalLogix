package com.vitallogix.backend.config;

import com.vitallogix.backend.model.Role;
import com.vitallogix.backend.model.User;
import com.vitallogix.backend.model.Category;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.repository.CategoryRepository;
import com.vitallogix.backend.repository.ProductRepository;
import com.vitallogix.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Value("${app.bootstrap.seed-categories.enabled:${APP_BOOTSTRAP_SEED_CATEGORIES_ENABLED:true}}")
    private boolean bootstrapSeedCategoriesEnabled;

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Always ensure there is at least one admin for first-time local testing.
            seedUserIfMissing(userRepository, passwordEncoder, bootstrapAdminUsername, bootstrapAdminPassword, Set.of(Role.ADMIN));

            if (bootstrapDemoUserEnabled) {
                seedUserIfMissing(userRepository, passwordEncoder, bootstrapDemoUserUsername, bootstrapDemoUserPassword, Set.of(Role.USER));
            }

            if (bootstrapSeedCategoriesEnabled) {
                seedDefaultCategoriesIfMissing(categoryRepository);
                syncCategoriesFromProducts(categoryRepository, productRepository);
            }
        };
    }

    private void seedDefaultCategoriesIfMissing(CategoryRepository categoryRepository) {
        List<String> defaults = List.of("Vitaminas", "Suplementos", "Medicamentos");
        for (String categoryName : defaults) {
            if (categoryRepository.existsByNameIgnoreCase(categoryName)) {
                continue;
            }

            Category c = new Category();
            c.setName(categoryName);
            c.setDescription("Predefined bootstrap category");
            c.setStatus(Category.StatusEnum.ACTIVE);
            c.setType(Category.TypeEnum.PREDEFINED);
            c.setVisibleInSuggestions(true);
            categoryRepository.save(c);
        }
    }

    private void syncCategoriesFromProducts(CategoryRepository categoryRepository, ProductRepository productRepository) {
        Set<String> existing = categoryRepository.findAll().stream()
                .map(Category::getName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .map(name -> name.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());

        Set<String> productCategoryNames = productRepository.findAll().stream()
                .map(Product::getCategory)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .collect(Collectors.toSet());

        for (String productCategoryName : productCategoryNames) {
            if (existing.contains(productCategoryName.toLowerCase(Locale.ROOT))) {
                continue;
            }

            Category c = new Category();
            c.setName(productCategoryName);
            c.setDescription("Auto-created from product category");
            c.setStatus(Category.StatusEnum.ACTIVE);
            c.setType(Category.TypeEnum.PREDEFINED);
            c.setVisibleInSuggestions(true);
            categoryRepository.save(c);
        }
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
