package com.vitallogix.backend.config;

import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.i18n.LocaleContextHolder;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenApiCustomizer openApiI18nCustomizer(MessageSource messageSource) {
        return openApi -> {
            var locale = LocaleContextHolder.getLocale();

            String title = messageSource.getMessage("api.title", null, locale);
            String description = messageSource.getMessage("api.description", null, locale);

            if (openApi.getInfo() == null) {
                openApi.setInfo(new Info());
            }
            openApi.getInfo().setTitle(title);
            openApi.getInfo().setDescription(description);
        };
    }
}
