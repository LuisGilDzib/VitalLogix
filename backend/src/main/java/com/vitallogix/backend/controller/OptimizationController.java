package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.ComboSuggestionRequest;
import com.vitallogix.backend.dto.ComboSuggestionResponse;
import com.vitallogix.backend.dto.KnapsackRequest;
import com.vitallogix.backend.dto.KnapsackResponse;
import com.vitallogix.backend.service.ComboSuggestionService;
import com.vitallogix.backend.service.KnapsackService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/optimization")
public class OptimizationController {

    private final KnapsackService knapsackService;
    private final ComboSuggestionService comboSuggestionService;

    public OptimizationController(KnapsackService knapsackService, ComboSuggestionService comboSuggestionService) {
        this.knapsackService = knapsackService;
        this.comboSuggestionService = comboSuggestionService;
    }

    @PostMapping("/knapsack")
    public KnapsackResponse solveKnapsack(@Valid @RequestBody KnapsackRequest request) {
        return knapsackService.optimize(request);
    }

    @PostMapping("/personalized-recommendations")
    public ComboSuggestionResponse suggestCombo(@Valid @RequestBody ComboSuggestionRequest request) {
        return comboSuggestionService.suggest(request);
    }
}
