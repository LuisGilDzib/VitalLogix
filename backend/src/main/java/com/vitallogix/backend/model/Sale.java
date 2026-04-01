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
    
    private BigDecimal discountAmount = BigDecimal.ZERO; // 10% para clienteamigo
    
    private BigDecimal originalAmount; // Monto antes del descuento


    @OneToMany(cascade = CascadeType.ALL, mappedBy = "sale") // MappedBy ayuda a la relación bidireccional
    private List<SaleItem> items;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    @PrePersist
    protected void onCreate() {
        this.saleDate = LocalDateTime.now();
    }
    public void addItem(SaleItem item) {
    if (items == null) {
        this.items = new java.util.ArrayList<>();
    }
    items.add(item);
    item.setSale(this); // Establece la relación hacia atrás automáticamente
}


    // GETTERS Y SETTERS 
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

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

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