package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.CampaignRequest;
import com.vitallogix.backend.dto.CampaignResponse;
import com.vitallogix.backend.model.Campaign;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.repository.CampaignRepository;
import com.vitallogix.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "*")
public class CampaignController {

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
        campaign.setName(request.getName());
        campaign.setDescription(request.getDescription());
        campaign.setPromotionType(request.getPromotionType() != null ? request.getPromotionType() : "NONE");
        campaign.setPromoBuyQuantity(request.getPromoBuyQuantity());
        campaign.setPromoPayQuantity(request.getPromoPayQuantity());
        campaign.setPromoPercentDiscount(request.getPromoPercentDiscount());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        campaign.setActive(request.isActive());

        // Assign products
        if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
            Set<Product> products = request.getProductIds().stream()
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
    public ResponseEntity<CampaignResponse> updateCampaign(@PathVariable Long id, @RequestBody CampaignRequest request) {
        Campaign campaign = campaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Campaign not found"));

        // Validate promotion fields
        validatePromotionFields(request);

        campaign.setName(request.getName());
        campaign.setDescription(request.getDescription());
        campaign.setPromotionType(request.getPromotionType() != null ? request.getPromotionType() : "NONE");
        campaign.setPromoBuyQuantity(request.getPromoBuyQuantity());
        campaign.setPromoPayQuantity(request.getPromoPayQuantity());
        campaign.setPromoPercentDiscount(request.getPromoPercentDiscount());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        campaign.setActive(request.isActive());

        // Update products
        if (request.getProductIds() != null) {
            Set<Product> products = request.getProductIds().stream()
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
        String promotionType = (request.getPromotionType() != null ? request.getPromotionType() : "NONE").toUpperCase();
        
        if ("BUY_X_PAY_Y".equals(promotionType)) {
            Integer buy = request.getPromoBuyQuantity();
            Integer pay = request.getPromoPayQuantity();
            if (buy == null || pay == null || buy < 2 || pay < 1 || pay >= buy) {
                throw new RuntimeException("Invalid BUY_X_PAY_Y promotion: buy must be >= 2 and pay must be between 1 and buy-1");
            }
        } else if ("PERCENTAGE".equals(promotionType)) {
            if (request.getPromoPercentDiscount() == null || request.getPromoPercentDiscount().doubleValue() <= 0 || request.getPromoPercentDiscount().doubleValue() >= 100) {
                throw new RuntimeException("Invalid PERCENTAGE promotion: discount must be between 0 and 100 (exclusive)");
            }
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
