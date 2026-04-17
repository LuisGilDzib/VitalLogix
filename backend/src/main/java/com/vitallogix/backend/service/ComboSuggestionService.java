package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.ComboSuggestionRequest;
import com.vitallogix.backend.dto.ComboSuggestionResponse;
import com.vitallogix.backend.model.Category;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.repository.CategoryRepository;
import com.vitallogix.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Locale;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class ComboSuggestionService {

    // Configuration values injected from application.properties, enabling runtime configuration changes.
    // This adheres to Open/Closed Principle: system is open for configuration without code modification.
    @Value("${app.suggestion.exploration-weight:0.65}")
    private double explorationWeight;

    @Value("${app.suggestion.max-recommendations:6}")
    private int defaultMaxRecommendations;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ComboSuggestionService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // Generates personalized product recommendations using a stateless UCB (multi-armed bandit) algorithm.\n    // Respects product visibility flags (visibleToUsers, visibleInSuggestions) and category approval.\n    // Filters out prescription-only products and out-of-stock items.\n    // Returns up to maxRecommendations items ranked by bandit score (exploitation + exploration).

    public ComboSuggestionResponse suggest(ComboSuggestionRequest request) {
        List<Product> products = productRepository.findByStockGreaterThan(0).stream()
                .filter(Product::isVisibleToUsers)
                .filter(Product::isVisibleInSuggestions)
                .filter(p -> !p.isRequiresPrescription())
                .toList();

        Set<String> visibleCategoryNames = categoryRepository
                .findByStatusAndVisibleInSuggestionsTrueOrderByNameAsc(Category.StatusEnum.ACTIVE)
                .stream()
                .map(Category::getName)
                .filter(name -> name != null && !name.isBlank())
                .map(name -> name.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());

        products = products.stream()
                .filter(product -> isCategoryAllowed(product.getCategory(), visibleCategoryNames))
                .toList();

        Map<Long, Product> productsById = products.stream().collect(Collectors.toMap(Product::getId, p -> p));

        Set<Long> prioritizedIds = new LinkedHashSet<>(request.getPrioritizedProductIds() == null
                ? List.of()
                : request.getPrioritizedProductIds());

        List<ComboSuggestionResponse.ComboItem> prioritizedItems = new ArrayList<>();
        BigDecimal prioritizedCost = BigDecimal.ZERO;
        double prioritizedScore = 0;

        Map<String, Integer> categoryAffinity = new HashMap<>();
        BigDecimal maxPrice = products.stream()
                .map(Product::getPrice)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ONE);

        for (Long id : prioritizedIds) {
            Product p = productsById.get(id);
            if (p == null) {
                continue;
            }

            double score = estimateReward(p, categoryAffinity, maxPrice);
            prioritizedItems.add(toItem(p, score));
            prioritizedCost = prioritizedCost.add(p.getPrice());
            prioritizedScore += score;

            if (p.getCategory() != null && !p.getCategory().isBlank()) {
                String key = p.getCategory().trim().toLowerCase(Locale.ROOT);
                categoryAffinity.put(key, categoryAffinity.getOrDefault(key, 0) + 1);
            }
        }

        ComboSuggestionResponse response = new ComboSuggestionResponse();
        response.setPrioritizedItems(prioritizedItems);
        response.setPrioritizedCost(prioritizedCost.setScale(2, RoundingMode.HALF_UP));

        List<BanditCandidate> candidates = new ArrayList<>();
        for (Product p : products) {
            if (prioritizedIds.contains(p.getId())) {
                continue;
            }

            if (p.getPrice() == null || p.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            double expectedReward = estimateReward(p, categoryAffinity, maxPrice);
            int syntheticPulls = estimatePulls(p);
            candidates.add(new BanditCandidate(p, expectedReward, syntheticPulls));
        }

        List<ComboSuggestionResponse.ComboItem> recommendedItems = new ArrayList<>();
        BigDecimal recommendedCost = BigDecimal.ZERO;

        int totalPulls = Math.max(1, candidates.stream().mapToInt(BanditCandidate::pulls).sum());
        candidates.sort(Comparator.comparingDouble(c -> -banditScore(c, totalPulls)));

        int maxRecommendations = request.getMaxRecommendations() == null
                ? defaultMaxRecommendations
                : request.getMaxRecommendations();

        for (BanditCandidate candidate : candidates.stream().limit(maxRecommendations).toList()) {
            double score = banditScore(candidate, totalPulls);
            recommendedItems.add(toItem(candidate.product(), score));
            recommendedCost = recommendedCost.add(candidate.product().getPrice());
        }

        response.setRecommendedItems(recommendedItems);
        response.setRecommendedCost(recommendedCost.setScale(2, RoundingMode.HALF_UP));
        response.setTotalCost(prioritizedCost.add(recommendedCost).setScale(2, RoundingMode.HALF_UP));
        double totalScore = prioritizedScore + recommendedItems.stream()
                .mapToDouble(item -> item.getScore() / 1000.0)
                .sum();
        response.setTotalScore((int) Math.round(totalScore * 1000));
        response.setMessage(recommendedItems.isEmpty()
                ? "No hay sugerencias disponibles con los filtros configurados por administracion"
                : "Sugerencias generadas con motor bandido (exploracion + afinidad)");
        return response;
    }

    // Check if product's category is allowed by admin policy.
    // Categories not in visibleCategoryNames set are filtered out.
    private boolean isCategoryAllowed(String category, Set<String> visibleCategoryNames) {
        if (category == null || category.isBlank()) {
            return true;
        }
        return visibleCategoryNames.contains(category.trim().toLowerCase(Locale.ROOT));
    }

    // Estimate pulls (mock purchase count) for UCB calculation.
    // Based on stock level: min=1, max=30. Higher stock = higher pull count = higher confidence.
    // Formula: pulls = min(30, max(1, stock/3 + 1))
    private int estimatePulls(Product product) {
        int stock = product.getStock() == null ? 0 : product.getStock();
        return Math.max(1, Math.min(30, stock / 3 + 1));
    }

    // Calculate expected reward (0-1 scale) using weighted formula:
    // - 50% affinity: how many times this product's category appeared in the prioritized cart
    // - 30% stock signal: availability (stock/20), capped at 1.0
    // - 20% normalized price: relative to max price in catalog
    // + stable noise: product ID-based deterministic factor for tiebreaking
    // Result range: roughly [0.0, 1.1] depending on stock and category presence.
    private double estimateReward(Product product, Map<String, Integer> categoryAffinity, BigDecimal maxPrice) {
        String categoryKey = product.getCategory() == null ? "" : product.getCategory().trim().toLowerCase(Locale.ROOT);
        int affinityCount = categoryAffinity.getOrDefault(categoryKey, 0);
        // Affinity plateaus at 1.0 after 3 purchases from same category
        double affinity = Math.min(1.0, affinityCount / 3.0);

        // Stock signal: availability metric (max 1.0 when stock >= 20)
        double stockSignal = Math.min(1.0, (product.getStock() == null ? 0 : product.getStock()) / 20.0);

        // Normalized price: default 0.5, adjusted if catalog has prices > 0
        double normalizedPrice = 0.5;
        if (maxPrice.compareTo(BigDecimal.ZERO) > 0) {
            normalizedPrice = product.getPrice().divide(maxPrice, 4, RoundingMode.HALF_UP).doubleValue();
        }

        // Stable noise: deterministic per-product value (0.001-0.999) for consistent tiebreaking
        double stableNoise = ((product.getId() == null ? 1L : product.getId()) % 17) / 1000.0;
        return (0.50 * affinity) + (0.30 * stockSignal) + (0.20 * normalizedPrice) + stableNoise;
    }

    // Compute UCB score: balances exploitation (expected reward) with exploration (uncertainty).
    // UCB = reward + explorationWeight * sqrt(ln(totalPulls) / (pulls + 1))
    // High exploration term when totalPulls >> pulls (rarely seen product).
    private double banditScore(BanditCandidate candidate, int totalPulls) {
        double exploration = Math.sqrt(Math.log(totalPulls + 1.0) / (candidate.pulls() + 1.0));
        return candidate.expectedReward() + (explorationWeight * exploration);
    }

    // Maps the product entity to the response item used by the recommendation engine.
    // Convert Product entity to response item with bandit score.
    // Score is scaled to 0-1000 for readability in frontend.
    private ComboSuggestionResponse.ComboItem toItem(Product p, double score) {
        ComboSuggestionResponse.ComboItem item = new ComboSuggestionResponse.ComboItem();
        item.setId(p.getId());
        item.setName(p.getName());
        item.setPrice(p.getPrice());
        item.setStock(p.getStock());
        item.setScore((int) Math.round(score * 1000));
        return item;
    }

    private record BanditCandidate(Product product, double expectedReward, int pulls) {}
}
