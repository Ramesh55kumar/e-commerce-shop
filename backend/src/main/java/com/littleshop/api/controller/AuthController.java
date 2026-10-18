package com.littleshop.api.controller;

import com.littleshop.api.model.ShopUser;
import com.littleshop.api.repository.UserRepository;
import com.littleshop.api.service.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users; private final PasswordEncoder passwords; private final JwtService jwt;
    public AuthController(UserRepository users, PasswordEncoder passwords, JwtService jwt) { this.users = users; this.passwords = passwords; this.jwt = jwt; }
    public record Credentials(@NotBlank @Email String email, @NotBlank @Size(min=8, max=72) String password) {}
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody Credentials credentials) {
        String email = credentials.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        users.save(new ShopUser(email, passwords.encode(credentials.password())));
        return Map.of("token", jwt.create(email), "email", email);
    }
    @PostMapping("/login")
    public Map<String, String> login(@Valid @RequestBody Credentials credentials) {
        String email = credentials.email().trim().toLowerCase();
        ShopUser user = users.findByEmailIgnoreCase(email).filter(u -> passwords.matches(credentials.password(), u.getPasswordHash()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect"));
        return Map.of("token", jwt.create(user.getEmail()), "email", user.getEmail());
    }
}
