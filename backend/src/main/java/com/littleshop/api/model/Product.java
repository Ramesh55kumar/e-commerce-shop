package com.littleshop.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String category;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Column(length = 1000) private String imageUrl;
    @Column(length = 2000) private String description;
    private boolean active = true;

    protected Product() {}
    public Product(String name, String category, BigDecimal price, String imageUrl, String description) {
        this.name = name; this.category = category; this.price = price; this.imageUrl = imageUrl; this.description = description;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public String getImageUrl() { return imageUrl; }
    public String getDescription() { return description; }
    public boolean isActive() { return active; }
}
