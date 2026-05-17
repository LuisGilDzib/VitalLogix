package com.vitallogix.backend.strategy;

import java.math.BigDecimal;

public class BuyXPayYPromotionStrategy implements PromotionStrategy {
    @Override
    public BigDecimal calculateNet(BigDecimal unitPrice, int quantity, Integer buy, Integer pay, BigDecimal percent) {
        if (buy != null && pay != null && buy >= 2 && pay >= 1 && pay < buy && quantity >= buy) {
            int groups = quantity / buy;
            int remainder = quantity % buy;
            int payableUnits = (groups * pay) + remainder;
            return unitPrice.multiply(BigDecimal.valueOf(payableUnits));
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    @Override
    public void validate(Integer buy, Integer pay, BigDecimal percent) {
        if (buy == null || pay == null || buy < 2 || pay < 1 || pay >= buy) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, 
                "Oferta BUY_X_PAY_Y invalida. Usa buy>=2 y 1<=pay<buy."
            );
        }
    }
}
