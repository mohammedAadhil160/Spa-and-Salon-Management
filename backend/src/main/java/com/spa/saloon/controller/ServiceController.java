package com.spa.saloon.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @GetMapping
    public List<Map<String, Object>> getServices() {
        return Arrays.asList(
            Map.of("id", 1, "name", "Premium Haircut", "price", "$45", "type", "Hair", "popular", true),
            Map.of("id", 2, "name", "Deep Tissue Massage", "price", "$80", "type", "Spa", "popular", true),
            Map.of("id", 3, "name", "Keratin Treatment", "price", "$120", "type", "Hair", "popular", false),
            Map.of("id", 4, "name", "Aromatherapy Facial", "price", "$60", "type", "Spa", "popular", true)
        );
    }

    @GetMapping("/offers")
    public List<Map<String, Object>> getOffers() {
        return Arrays.asList(
            Map.of("id", 1, "title", "Summer Glow Up", "description", "Get 20% off on all basic haircuts + free wash.", "discount", "20%"),
            Map.of("id", 2, "title", "Couples Spa Day", "description", "Bring a partner and enjoy 30% off any premium massage.", "discount", "30%")
        );
    }
    
    @GetMapping("/recommendations")
    public List<Map<String, Object>> getRecommendations() {
        return Arrays.asList(
            Map.of("id", 2, "name", "Deep Tissue Massage", "reason", "Highly rated for relaxation and stress relief."),
            Map.of("id", 1, "name", "Premium Haircut", "reason", "Our most requested unisex service this week.")
        );
    }
}
