package com.vitallogix.backend.strategy;

import java.math.BigDecimal;

public class NoPromotionStrategy implements PromotionStrategy {
    @Override
    public BigDecimal calculateNet(BigDecimal unitPrice, int quantity, Integer buy, Integer pay, BigDecimal percent) {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    @Override
    public void validate(Integer buy, Integer pay, BigDecimal percent) {
        // No validation needed for NONE
    }
}
