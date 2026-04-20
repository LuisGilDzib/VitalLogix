package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.ReceiptResponse;
import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.model.Customer;
import com.vitallogix.backend.repository.SaleRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {
    private final SaleRepository saleRepository;
    public ReceiptController(SaleRepository saleRepository) {
        this.saleRepository = saleRepository;
    }

    @GetMapping("/{saleId}")
    public ReceiptResponse getReceipt(@PathVariable Long saleId) {
        Sale sale = saleRepository.findById(saleId).orElseThrow();
        ReceiptResponse receipt = new ReceiptResponse();
        receipt.setSaleId(sale.getId());
        receipt.setSaleDate(sale.getSaleDate());
        Customer c = sale.getCustomer();
        if (c != null) {
            receipt.setCustomerName(c.getName());
            receipt.setCustomerAddress(c.getAddress());
            receipt.setCustomerPhone(c.getPhone());
        }
        // Use the values stored in the sale; they already include the discount if applicable.
        java.math.BigDecimal originalAmount = sale.getOriginalAmount() != null ? sale.getOriginalAmount() : sale.getTotalAmount();
        java.math.BigDecimal discountAmount = sale.getDiscountAmount() != null ? sale.getDiscountAmount() : java.math.BigDecimal.ZERO;
        
        receipt.setTotalAmount(originalAmount); // Original total before discount
        receipt.setDiscount(discountAmount);     // Applied discount
        receipt.setFinalAmount(sale.getTotalAmount()); // Final total after discount
        receipt.setLoyaltyAwardedCode(sale.getLoyaltyAwardedCode());
        
        List<ReceiptResponse.Item> items = sale.getItems().stream().map(item -> {
            ReceiptResponse.Item i = new ReceiptResponse.Item();
            i.setProductName(item.getProduct().getName());
            i.setQuantity(item.getQuantity());
            i.setUnitPrice(item.getUnitPrice());
            i.setSubtotal(item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())));
            return i;
        }).collect(Collectors.toList());
        receipt.setItems(items);
        return receipt;
    }
}
