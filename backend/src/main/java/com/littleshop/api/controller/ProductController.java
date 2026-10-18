package com.littleshop.api.controller;

import com.littleshop.api.model.Product;
import com.littleshop.api.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;
    public ProductController(ProductRepository products) { this.products = products; }
    @GetMapping public List<Product> list() { return products.findByActiveTrueOrderByIdAsc(); }
    @GetMapping("/{id}") public Product get(@PathVariable Long id) {
        Product product = products.findById(id).orElseThrow(() -> new java.util.NoSuchElementException("Product not found"));
        if (!product.isActive()) throw new java.util.NoSuchElementException("Product not found");
        return product;
    }
}
