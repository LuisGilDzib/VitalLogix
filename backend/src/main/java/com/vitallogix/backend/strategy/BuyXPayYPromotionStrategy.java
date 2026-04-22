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
}
