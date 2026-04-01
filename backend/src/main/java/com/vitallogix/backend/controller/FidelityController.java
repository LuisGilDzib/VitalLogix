package com.vitallogix.backend.controller;

import com.vitallogix.backend.model.Customer;
import com.vitallogix.backend.repository.CustomerRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fidelity")
public class FidelityController {
    private final CustomerRepository customerRepository;
    public FidelityController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // Assigns the customer amigo flag.
    @PostMapping("/assign/{id}")
    public void assignFidelity(@PathVariable Long id) {
        Customer c = customerRepository.findById(id).orElseThrow();
        c.setFriend(true);
        customerRepository.save(c);
    }

    // Removes the loyalty program flag.
    @PostMapping("/remove/{id}")
    public void removeFidelity(@PathVariable Long id) {
        Customer c = customerRepository.findById(id).orElseThrow();
        c.setFriend(false);
        customerRepository.save(c);
    }
}
