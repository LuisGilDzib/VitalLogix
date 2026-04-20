package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.AdminUserResponse;
import com.vitallogix.backend.dto.CreateAdminUserRequest;
import com.vitallogix.backend.model.Role;
import com.vitallogix.backend.model.User;
import com.vitallogix.backend.repository.SaleRepository;
import com.vitallogix.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, SaleRepository saleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.saleRepository = saleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getUsername, String.CASE_INSENSITIVE_ORDER))
                .map(this::toResponse)
                .toList();
    }

    @PostMapping("/users")
    public ResponseEntity<?> createAdmin(@RequestBody CreateAdminUserRequest request) {
        String username = request.getUsername() == null ? "" : request.getUsername().trim();
        String password = request.getPassword();

        if (username.isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(Role.ADMIN);
        user.setRoles(adminRoles);
        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PostMapping("/users/{userId}/promote")
    public ResponseEntity<?> promoteToAdmin(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        Set<Role> roles = user.getRoles();
        if (roles != null && roles.contains(Role.ADMIN)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User is already admin");
        }

        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(Role.ADMIN);
        user.setRoles(adminRoles);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(toResponse(saved));
    }

    @Transactional
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, Authentication authentication) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        String currentUsername = authentication != null ? authentication.getName() : null;
        if (currentUsername != null && currentUsername.equalsIgnoreCase(user.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No puedes eliminar tu propia cuenta");
        }

        boolean isTargetAdmin = user.getRoles() != null && user.getRoles().contains(Role.ADMIN);
        if (isTargetAdmin) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRoles() != null && u.getRoles().contains(Role.ADMIN))
                    .count();
            if (adminCount <= 1) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("No se puede eliminar el ultimo administrador");
            }
        }

        try {
            userRepository.deleteRolesByUserId(userId);
            userRepository.delete(user);
            userRepository.flush();
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No se puede eliminar este usuario porque tiene referencias asociadas");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al eliminar usuario");
        }
    }

    private AdminUserResponse toResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setRoles(user.getRoles());
        response.setClienteAmigoNumber(user.getClienteAmigoNumber());
        response.setCouponAvailable(user.getClienteAmigoNumber() != null && !user.isCouponUsed());
        response.setPurchasesSinceCoupon(user.getPurchasesSinceCoupon() == null ? 0 : user.getPurchasesSinceCoupon());
        response.setTotalPurchaseCount(saleRepository.countByAccountUsernameIgnoreCase(user.getUsername()));
        return response;
    }
}
