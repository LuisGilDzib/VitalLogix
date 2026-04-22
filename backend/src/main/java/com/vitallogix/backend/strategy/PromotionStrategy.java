package com.vitallogix.backend.strategy;

import java.math.BigDecimal;

public interface PromotionStrategy {
    BigDecimal calculateNet(BigDecimal unitPrice, int quantity, Integer buy, Integer pay, BigDecimal percent);
}
