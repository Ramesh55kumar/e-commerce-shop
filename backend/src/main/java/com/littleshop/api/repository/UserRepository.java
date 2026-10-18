package com.littleshop.api.repository;

import com.littleshop.api.model.ShopUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<ShopUser, Long> {
    Optional<ShopUser> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
