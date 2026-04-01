package com.vitallogix.backend.repository;

import com.vitallogix.backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByClienteAmigoNumber(String clienteAmigoNumber);
    boolean existsByClienteAmigoNumberIgnoreCase(String clienteAmigoNumber);
}
