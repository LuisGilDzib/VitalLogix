package com.vitallogix.backend.repository;

import com.vitallogix.backend.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    long countByCustomer_Id(Long customerId);
    long countByAccountUsernameIgnoreCase(String accountUsername);
    
    List<Sale> findByCustomer_IdOrderBySaleDateDesc(Long customerId);
}