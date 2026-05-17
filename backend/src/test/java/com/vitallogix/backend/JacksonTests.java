package com.vitallogix.backend;

import com.vitallogix.backend.dto.CampaignRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.boot.test.json.ObjectContent;

import static org.assertj.core.api.Assertions.assertThat;

@JsonTest
public class JacksonTests {

    @Autowired
    private JacksonTester<CampaignRequest> json;

    @Test
    public void testDeserialization() throws Exception {
        String content = "{\n" +
                "  \"name\": \"Campaign Test\",\n" +
                "  \"description\": \"\",\n" +
                "  \"promotionType\": \"PERCENTAGE\",\n" +
                "  \"promoPercentDiscount\": 15,\n" +
                "  \"startDate\": \"2026-05-05T00:00:00\",\n" +
                "  \"endDate\": \"2026-05-08T23:59:00\",\n" +
                "  \"active\": true,\n" +
                "  \"productIds\": [1, 2, 3]\n" +
                "}";

        ObjectContent<CampaignRequest> parsed = json.parse(content);
        CampaignRequest request = parsed.getObject();
        System.out.println("PARSED isActive: " + request.active());
        assertThat(request.active()).isTrue();
    }
}
