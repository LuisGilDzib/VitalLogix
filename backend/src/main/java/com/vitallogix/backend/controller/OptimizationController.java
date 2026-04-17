package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.ComboSuggestionRequest;
import com.vitallogix.backend.dto.ComboSuggestionResponse;
import com.vitallogix.backend.service.ComboSuggestionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/optimization")
public class OptimizationController {

    private final ComboSuggestionService comboSuggestionService;

    public OptimizationController(ComboSuggestionService comboSuggestionService) {
        this.comboSuggestionService = comboSuggestionService;
    }

    @PostMapping("/personalized-recommendations")
    public ComboSuggestionResponse suggestCombo(@Valid @RequestBody ComboSuggestionRequest request) {
        return comboSuggestionService.suggest(request);
    }
}
