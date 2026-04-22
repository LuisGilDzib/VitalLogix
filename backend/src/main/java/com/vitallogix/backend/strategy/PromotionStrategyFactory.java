package com.vitallogix.backend.strategy;

import java.util.HashMap;
import java.util.Map;

public class PromotionStrategyFactory {
    // Patrón Singleton: Instancia única inicializada tempranamente (Eager Initialization)
    private static final PromotionStrategyFactory INSTANCE = new PromotionStrategyFactory();
    
    private final Map<String, PromotionStrategy> strategies = new HashMap<>();

    // Constructor privado para evitar instanciación externa
    private PromotionStrategyFactory() {
        strategies.put("PERCENTAGE", new PercentagePromotionStrategy());
        strategies.put("BUY_X_PAY_Y", new BuyXPayYPromotionStrategy());
        strategies.put("NONE", new NoPromotionStrategy());
    }

    // Punto de acceso global a la instancia
    public static PromotionStrategyFactory getInstance() {
        return INSTANCE;
    }

    // Método de instancia para obtener la estrategia
    public PromotionStrategy getStrategy(String type) {
        return strategies.getOrDefault(type != null ? type.trim().toUpperCase() : "NONE", strategies.get("NONE"));
    }
}
