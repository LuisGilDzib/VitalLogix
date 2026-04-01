package com.vitallogix.backend.controller;

import com.vitallogix.backend.dto.CustomerRequest;
import com.vitallogix.backend.dto.CustomerResponse;
import com.vitallogix.backend.model.Customer;
import com.vitallogix.backend.model.Sale;
import com.vitallogix.backend.repository.CustomerRepository;
import com.vitallogix.backend.repository.SaleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {
    private final CustomerRepository repository;
    private final SaleRepository saleRepository;

    public CustomerController(CustomerRepository repository, SaleRepository saleRepository) {
        this.repository = repository;
        this.saleRepository = saleRepository;
    }

    @GetMapping
    public List<CustomerResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public CustomerResponse findById(@PathVariable Long id) {
        Customer customer = repository.findById(id).orElseThrow();
        return toResponse(customer);
    }

    @GetMapping("/{id}/purchases")
    public List<Sale> getPurchaseHistory(@PathVariable Long id) {
        repository.findById(id).orElseThrow(); // Verifies that the customer exists
        return saleRepository.findByCustomer_IdOrderBySaleDateDesc(id);
    }

    // Validates a clienteamigo code and returns the status plus basic customer data.
    @GetMapping("/validate-clienteamigo")
    public Map<String, Object> validateClienteAmigo(@RequestParam String code) {
        if (code == null || code.trim().isEmpty()) {
            return Map.of(
                "valid", false,
                "message", "Ingresa un numero clienteamigo"
            );
        }

        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        Customer customer = repository.findByClienteAmigoNumber(normalizedCode).orElse(null);

        if (customer == null || !customer.isFriend()) {
            return Map.of(
                "valid", false,
                "message", "Codigo clienteamigo invalido"
            );
        }

        return Map.of(
            "valid", true,
            "message", "Codigo clienteamigo valido",
            "customerId", customer.getId(),
            "customerName", customer.getName() == null ? "" : customer.getName(),
            "customerPhone", customer.getPhone() == null ? "" : customer.getPhone()
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(@RequestBody CustomerRequest request) {
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setAddress(request.getAddress());
        customer.setPhone(request.getPhone());
        customer.setClienteAmigoNumber(request.getClienteAmigoNumber());
        customer.setFriend(request.isFriend());
        return toResponse(repository.save(customer));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public CustomerResponse update(@PathVariable Long id, @RequestBody CustomerRequest request) {
        Customer customer = repository.findById(id).orElseThrow();
        customer.setName(request.getName());
        customer.setAddress(request.getAddress());
        customer.setPhone(request.getPhone());
        customer.setClienteAmigoNumber(request.getClienteAmigoNumber());
        customer.setFriend(request.isFriend());
        return toResponse(repository.save(customer));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    private CustomerResponse toResponse(Customer customer) {
        long purchaseCount = customer.getId() != null ? saleRepository.countByCustomer_Id(customer.getId()) : 0;
        return new CustomerResponse(
            customer.getId(),
            customer.getName(),
            customer.getAddress(),
            customer.getPhone(),
            customer.getClienteAmigoNumber(),
            customer.isFriend(),
            purchaseCount
        );
    }
}
