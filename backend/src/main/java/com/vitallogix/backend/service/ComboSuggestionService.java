package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.ComboSuggestionRequest;
import com.vitallogix.backend.dto.ComboSuggestionResponse;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ComboSuggestionService {

    private final ProductRepository productRepository;

    public ComboSuggestionService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Genera recomendaciones personalizadas usando mochila 0/1 sobre el presupuesto restante.
     */
    public ComboSuggestionResponse suggest(ComboSuggestionRequest request) {
        int capacity = toCents(request.getBudget());
        List<Product> products = productRepository.findByStockGreaterThan(0);
        Map<Long, Product> productsById = products.stream().collect(Collectors.toMap(Product::getId, p -> p));

        Set<Long> prioritizedIds = new LinkedHashSet<>(request.getPrioritizedProductIds() == null
                ? List.of()
                : request.getPrioritizedProductIds());

        List<ComboSuggestionResponse.ComboItem> prioritizedItems = new ArrayList<>();
        BigDecimal prioritizedCost = BigDecimal.ZERO;
        int prioritizedScore = 0;

        for (Long id : prioritizedIds) {
            Product p = productsById.get(id);
            if (p == null) {
                continue;
            }
            int priceCents = toCents(p.getPrice());
            int score = computeScore(p, priceCents);
            prioritizedItems.add(toItem(p, score));
            prioritizedCost = prioritizedCost.add(p.getPrice());
            prioritizedScore += score;
        }

        int remainingCapacity = capacity - toCents(prioritizedCost);

        ComboSuggestionResponse response = new ComboSuggestionResponse();
        response.setBudget(request.getBudget().setScale(2, RoundingMode.HALF_UP));
        response.setPrioritizedItems(prioritizedItems);
        response.setPrioritizedCost(prioritizedCost.setScale(2, RoundingMode.HALF_UP));

        if (remainingCapacity <= 0) {
            response.setBudgetExceededByPrioritized(remainingCapacity < 0);
            response.setRecommendedItems(List.of());
            response.setRecommendedCost(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
            response.setTotalCost(prioritizedCost.setScale(2, RoundingMode.HALF_UP));
            response.setTotalScore(prioritizedScore);
            response.setMessage(remainingCapacity < 0
                    ? "El presupuesto es menor al costo de los productos ya seleccionados"
                    : "Tu presupuesto se completo con los productos seleccionados");
            return response;
        }

        List<Candidate> candidates = new ArrayList<>();
        for (Product p : products) {
            if (prioritizedIds.contains(p.getId())) {
                continue;
            }
            int priceCents = toCents(p.getPrice());
            if (priceCents <= 0 || priceCents > remainingCapacity) {
                continue;
            }
            candidates.add(new Candidate(p, priceCents, computeScore(p, priceCents)));
        }

        int n = candidates.size();
        int[][] dp = new int[n + 1][remainingCapacity + 1];

        for (int i = 1; i <= n; i++) {
            Candidate c = candidates.get(i - 1);
            for (int w = 0; w <= remainingCapacity; w++) {
                dp[i][w] = dp[i - 1][w];
                if (c.weight <= w) {
                    int candidateValue = dp[i - 1][w - c.weight] + c.score;
                    if (candidateValue > dp[i][w]) {
                        dp[i][w] = candidateValue;
                    }
                }
            }
        }

        int remaining = remainingCapacity;
        List<ComboSuggestionResponse.ComboItem> recommendedItems = new ArrayList<>();
        BigDecimal recommendedCost = BigDecimal.ZERO;

        for (int i = n; i > 0 && remaining >= 0; i--) {
            if (dp[i][remaining] != dp[i - 1][remaining]) {
                Candidate c = candidates.get(i - 1);
                recommendedItems.add(toItem(c.product, c.score));

                recommendedCost = recommendedCost.add(c.product.getPrice());
                remaining -= c.weight;
            }
        }

        Collections.reverse(recommendedItems);

        int maxRecommendations = request.getMaxRecommendations() == null ? 6 : request.getMaxRecommendations();
        if (maxRecommendations < recommendedItems.size()) {
            recommendedItems = new ArrayList<>(recommendedItems.subList(0, maxRecommendations));
            recommendedCost = recommendedItems.stream()
                    .map(ComboSuggestionResponse.ComboItem::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        response.setBudgetExceededByPrioritized(false);
        response.setRecommendedItems(recommendedItems);
        response.setRecommendedCost(recommendedCost.setScale(2, RoundingMode.HALF_UP));
        response.setTotalCost(prioritizedCost.add(recommendedCost).setScale(2, RoundingMode.HALF_UP));
        response.setTotalScore(prioritizedScore + dp[n][remainingCapacity]);
        response.setMessage(recommendedItems.isEmpty()
                ? "No se encontraron recomendaciones adicionales con el presupuesto restante"
                : "Recomendaciones personalizadas generadas con base en tu carrito");
        return response;
    }

    /** Convierte un monto a centavos para operar con enteros en la mochila. */
    private int toCents(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValue();
    }

    /** Puntaje: prioriza rotación de stock bajo y valor económico del producto. */
    private int computeScore(Product p, int priceCents) {
        int stock = p.getStock() == null ? 0 : p.getStock();
        int stockBonus;
        if (stock <= 3) {
            stockBonus = 5000;
        } else if (stock <= 7) {
            stockBonus = 2000;
        } else {
            stockBonus = 500;
        }
        return priceCents + stockBonus;
    }

    /** Mapea entidad de producto a item de respuesta del motor de recomendaciones. */
    private ComboSuggestionResponse.ComboItem toItem(Product p, int score) {
        ComboSuggestionResponse.ComboItem item = new ComboSuggestionResponse.ComboItem();
        item.setId(p.getId());
        item.setName(p.getName());
        item.setPrice(p.getPrice());
        item.setStock(p.getStock());
        item.setScore(score);
        return item;
    }

    private static class Candidate {
        private final Product product;
        private final int weight;
        private final int score;

        private Candidate(Product product, int weight, int score) {
            this.product = product;
            this.weight = weight;
            this.score = score;
        }
    }
}
