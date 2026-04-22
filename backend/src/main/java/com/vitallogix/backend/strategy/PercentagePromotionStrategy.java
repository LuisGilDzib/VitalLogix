package com.vitallogix.backend.strategy;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class PercentagePromotionStrategy implements PromotionStrategy {
    @Override
    public BigDecimal calculateNet(BigDecimal unitPrice, int quantity, Integer buy, Integer pay, BigDecimal percent) {
        BigDecimal gross = unitPrice.multiply(BigDecimal.valueOf(quantity));
        if (percent != null && percent.compareTo(BigDecimal.ZERO) > 0 && percent.compareTo(BigDecimal.valueOf(100)) < 0) {
            BigDecimal multiplier = BigDecimal.ONE.subtract(percent.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
            return gross.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
        }
        return gross;
    }
}
