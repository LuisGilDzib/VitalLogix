package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.ComboSuggestionRequest;
import com.vitallogix.backend.dto.ComboSuggestionResponse;
import com.vitallogix.backend.model.Category;
import com.vitallogix.backend.model.Product;
import com.vitallogix.backend.repository.CategoryRepository;
import com.vitallogix.backend.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComboSuggestionServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ComboSuggestionService service;

    @Test
    void suggest_returnsRecommendations() {
        Product p1 = new Product();
        p1.setId(1L);
        p1.setName("A");
        p1.setPrice(new BigDecimal("10"));
        p1.setStock(10);
        p1.setVisibleInSuggestions(true);
        p1.setRequiresPrescription(false);
        p1.setCategory("cat");

        Product p2 = new Product();
        p2.setId(2L);
        p2.setName("B");
        p2.setPrice(new BigDecimal("20"));
        p2.setStock(5);
        p2.setVisibleInSuggestions(true);
        p2.setRequiresPrescription(false);
        p2.setCategory("cat");

        when(productRepository.findByStockGreaterThan(0)).thenReturn(List.of(p1, p2));
        when(categoryRepository.findByStatusAndVisibleInSuggestionsTrueOrderByNameAsc(any()))
                .thenReturn(List.of());

        ComboSuggestionRequest req = new ComboSuggestionRequest(List.of(), null);
        ComboSuggestionResponse resp = service.suggest(req);

        assertNotNull(resp);
        assertNotNull(resp.prioritizedItems());
        assertNotNull(resp.recommendedItems());
        assertTrue(resp.recommendedItems().size() > 0 || resp.prioritizedItems().size() > 0);
    }
}
