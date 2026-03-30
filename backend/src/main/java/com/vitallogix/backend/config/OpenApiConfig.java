package com.vitallogix.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "VitalLogix API",
                version = "v1",
                description = "API para gestión de productos de VitalLogix",
                contact = @Contact(
                        name = "Luis Gil",
                        email = "luis@example.com"
                )
        )
)
public class OpenApiConfig {
}
