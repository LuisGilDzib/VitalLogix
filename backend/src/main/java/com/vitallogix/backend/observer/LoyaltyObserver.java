package com.vitallogix.backend.observer;

import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.model.User;
import com.vitallogix.backend.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.UUID;

@Component
public class LoyaltyObserver implements SaleObserver {

    private final UserRepository userRepository;

    public LoyaltyObserver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void onSaleCompleted(Sale sale) {
        String username = sale.getAccountUsername();
        if (username == null || username.trim().isEmpty()) {
            return;
        }

        userRepository.findByUsername(username.trim()).ifPresent(accountUser -> {
            int nextCounter = (accountUser.getPurchasesSinceCoupon() == null ? 0 : accountUser.getPurchasesSinceCoupon()) + 1;

            if (nextCounter >= 5) {
                accountUser.setFriend(true);
                accountUser.setPurchasesSinceCoupon(0);
                accountUser.setClienteAmigoNumber(generateClienteAmigoCode());
                accountUser.setCouponUsed(false);
                
                // We update the sale with the awarded code if needed, 
                // though usually we'd do this before saving the sale. 
                // For this refactor, we'll let the observer handle the user state.
                sale.setLoyaltyAwardedCode(accountUser.getClienteAmigoNumber());
            } else {
                accountUser.setPurchasesSinceCoupon(nextCounter);
            }
            userRepository.save(accountUser);
        });
    }

    private String generateClienteAmigoCode() {
        for (int i = 0; i < 20; i++) {
            String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase(Locale.ROOT);
            String code = "CAM-" + suffix;
            if (!userRepository.existsByClienteAmigoNumberIgnoreCase(code)) {
                return code;
            }
        }
        return "CAM-ERROR";
    }
}
