package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.CampaignRequest;
import com.vitallogix.backend.dto.CampaignResponse;
import com.vitallogix.backend.model.Campaign;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.repository.CampaignRepository;
import com.vitallogix.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private static final Logger logger = LoggerFactory.getLogger(CampaignController.class);

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private ProductRepository productRepository;

    // Get all campaigns
    @GetMapping
    public ResponseEntity<List<CampaignResponse>> getAllCampaigns() {
        List<Campaign> campaigns = campaignRepository.findAll();
        List<CampaignResponse> responses = campaigns.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Get active campaigns at current time
    @GetMapping("/active")
    public ResponseEntity<List<CampaignResponse>> getActiveCampaigns() {
        LocalDateTime now = LocalDateTime.now();
        List<Campaign> campaigns = campaignRepository.findActiveCampaignsAtTime(now);
        List<CampaignResponse> responses = campaigns.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Get campaign by ID
    @GetMapping("/{id}")
    public ResponseEntity<CampaignResponse> getCampaignById(@PathVariable Long id) {
        Campaign campaign = campaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Campaign not found"));
        return ResponseEntity.ok(toResponse(campaign));
    }

    // Create campaign
    @PostMapping
    public ResponseEntity<CampaignResponse> createCampaign(@RequestBody CampaignRequest request) {
        // Validate promotion fields
        validatePromotionFields(request);

        Campaign campaign = new Campaign();
        campaign.setName(request.name());
        campaign.setDescription(request.description());
        campaign.setPromotionType(request.promotionType() != null ? request.promotionType() : "NONE");
        campaign.setPromoBuyQuantity(request.promoBuyQuantity());
        campaign.setPromoPayQuantity(request.promoPayQuantity());
        campaign.setPromoPercentDiscount(request.promoPercentDiscount());
        campaign.setStartDate(request.startDate());
        campaign.setEndDate(request.endDate());
        campaign.setActive(request.active());

        // Assign products
        if (request.productIds() != null && !request.productIds().isEmpty()) {
            Set<Product> products = request.productIds().stream()
                .map(id -> productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + id)))
                .collect(Collectors.toSet());
            campaign.setProducts(products);
        }

        Campaign saved = campaignRepository.save(campaign);
        return ResponseEntity.ok(toResponse(saved));
    }

    // Update campaign
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<CampaignResponse> updateCampaign(@PathVariable Long id, @RequestBody CampaignRequest request) {
        logger.info("Updating campaign {}: name={}, startDate={}, endDate={}", id, request.name(), request.startDate(), request.endDate());
        Campaign campaign = campaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Campaign not found"));

        // Validate promotion fields
        validatePromotionFields(request);

        campaign.setName(request.name());
        campaign.setDescription(request.description());
        campaign.setPromotionType(request.promotionType() != null ? request.promotionType() : "NONE");
        campaign.setPromoBuyQuantity(request.promoBuyQuantity());
        campaign.setPromoPayQuantity(request.promoPayQuantity());
        campaign.setPromoPercentDiscount(request.promoPercentDiscount());
        campaign.setStartDate(request.startDate());
        campaign.setEndDate(request.endDate());
        campaign.setActive(request.active());

        // Update products
        if (request.productIds() != null) {
            Set<Product> products = request.productIds().stream()
                .map(productId -> productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId)))
                .collect(Collectors.toSet());
            campaign.setProducts(products);
        }

        Campaign updated = campaignRepository.save(campaign);
        return ResponseEntity.ok(toResponse(updated));
    }

    // Toggle campaign active status
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<CampaignResponse> toggleCampaignStatus(@PathVariable Long id) {
        Campaign campaign = campaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Campaign not found"));
        campaign.setActive(!campaign.isActive());
        Campaign updated = campaignRepository.save(campaign);
        return ResponseEntity.ok(toResponse(updated));
    }

    // Delete campaign
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        campaignRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Helper method to validate promotion fields
    private void validatePromotionFields(CampaignRequest request) {
        String promotionType = (request.promotionType() != null ? request.promotionType() : "NONE").toUpperCase();
        com.vitallogix.backend.strategy.PromotionStrategy strategy = com.vitallogix.backend.strategy.PromotionStrategyFactory.getInstance().getStrategy(promotionType);
        
        try {
            strategy.validate(request.promoBuyQuantity(), request.promoPayQuantity(), request.promoPercentDiscount());
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw new RuntimeException(e.getReason() != null ? e.getReason() : e.getMessage());
        }
    }

    // Helper method to convert Campaign to CampaignResponse
    private CampaignResponse toResponse(Campaign campaign) {
        Set<Long> productIds = campaign.getProducts().stream()
            .map(Product::getId)
            .collect(Collectors.toSet());
        
        return new CampaignResponse(
            campaign.getId(),
            campaign.getName(),
            campaign.getDescription(),
            campaign.getPromotionType(),
            campaign.getPromoBuyQuantity(),
            campaign.getPromoPayQuantity(),
            campaign.getPromoPercentDiscount(),
            campaign.getStartDate(),
            campaign.getEndDate(),
            campaign.isActive(),
            campaign.getCreatedAt(),
            productIds
        );
    }
}
