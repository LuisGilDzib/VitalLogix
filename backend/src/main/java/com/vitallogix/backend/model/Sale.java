package com.vitallogix.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime saleDate;

    private BigDecimal totalAmount;
    
    // 10% discount applied when customer has clienteamigo loyalty status.
    // Always set to ZERO if customer is not a friend (loyalty member).
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    // Original total amount before applying any discounts. Useful for audit trail and reporting.
    private BigDecimal originalAmount;


    // Bidirectional relationship with SaleItem. Cascade ensures items are deleted when sale is deleted.
    // MappedBy indicates the reverse side of the relationship (SaleItem owns the foreign key).
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "sale")
    private List<SaleItem> items;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    // Auto-set sale timestamp when record is first persisted to database.
    @PrePersist
    protected void onCreate() {
        this.saleDate = LocalDateTime.now();
    }

    // Add item to sale and establish bidirectional relationship.
    // Initializes items list if null. Use this instead of directly modifying items list.
    public void addItem(SaleItem item) {
        if (items == null) {
            this.items = new java.util.ArrayList<>();
        }
        items.add(item);
        item.setSale(this);
    }

    // Getters and setters 
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(LocalDateTime saleDate) {
        this.saleDate = saleDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    // Returns discount amount applied to this sale.
    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    // Returns amount before discount. Used for reporting and audit trail.
    public BigDecimal getOriginalAmount() {
        return originalAmount;
    }

    public void setOriginalAmount(BigDecimal originalAmount) {
        this.originalAmount = originalAmount;
    }

    public List<SaleItem> getItems() {
        return items;
    }

    public void setItems(List<SaleItem> items) {
        this.items = items;
    }
}