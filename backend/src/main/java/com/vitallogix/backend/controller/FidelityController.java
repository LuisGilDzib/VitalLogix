package com.vitallogix.backend.controller;

import com.vitallogix.backend.model.User;
import com.vitallogix.backend.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/fidelity")
public class FidelityController {
    private final UserRepository userRepository;

    public FidelityController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/coupon/status")
    public Map<String, Object> couponStatus(Authentication authentication) {
        User user = currentUser(authentication);

        boolean hasAvailableCoupon = user.getClienteAmigoNumber() != null
                && !user.getClienteAmigoNumber().isBlank()
                && !user.isCouponUsed();

        int purchases = user.getPurchasesSinceCoupon() == null ? 0 : user.getPurchasesSinceCoupon();
        int purchasesToNextCoupon = Math.max(0, 5 - purchases);

        return Map.of(
                "hasAvailableCoupon", hasAvailableCoupon,
                "couponCode", hasAvailableCoupon ? user.getClienteAmigoNumber() : "",
                "purchasesSinceCoupon", purchases,
                "purchasesToNextCoupon", purchasesToNextCoupon
        );
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/coupon/validate")
    public Map<String, Object> validateCoupon(@RequestParam String code, Authentication authentication) {
        if (code == null || code.trim().isEmpty()) {
            return Map.of("valid", false, "message", "Ingresa un cupón para validar.");
        }

        User user = currentUser(authentication);
        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);

        if (user.getClienteAmigoNumber() == null || user.getClienteAmigoNumber().isBlank()) {
            return Map.of("valid", false, "message", "Tu cuenta no tiene cupones disponibles.");
        }

        if (user.isCouponUsed()) {
            return Map.of("valid", false, "message", "Tu cupón ya fue utilizado. Acumula 5 compras para recibir otro.");
        }

        if (!user.getClienteAmigoNumber().trim().equalsIgnoreCase(normalizedCode)) {
            return Map.of("valid", false, "message", "Ese cupón no pertenece a tu cuenta.");
        }

        return Map.of("valid", true, "message", "Cupón válido. Se aplicará 10% en esta compra.");
    }

    private User currentUser(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        if (username == null || username.isBlank()) {
            throw new RuntimeException("No se pudo identificar la cuenta autenticada.");
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada."));
    }
}
