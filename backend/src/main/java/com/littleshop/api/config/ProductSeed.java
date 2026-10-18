package com.littleshop.api.config;

import com.littleshop.api.model.Product;
import com.littleshop.api.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;

@Configuration
public class ProductSeed {
    @Bean CommandLineRunner seedProducts(ProductRepository products) {
        return args -> {
            if (products.count() > 0) return;
            products.save(new Product("Forma Table Lamp", "Lighting", new BigDecimal("128.00"), "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85", "A softly sculpted lamp for slow evenings."));
            products.save(new Product("Sunday Ceramic Set", "Tableware", new BigDecimal("64.00"), "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85", "Hand-finished ceramics for the everyday table."));
            products.save(new Product("Cloud Knit Throw", "Textiles", new BigDecimal("96.00"), "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85", "A generous, soft layer for the sofa."));
            products.save(new Product("Dune Bud Vase", "Objects", new BigDecimal("38.00"), "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85", "A small stoneware vase with an easy silhouette."));
        };
    }
}
