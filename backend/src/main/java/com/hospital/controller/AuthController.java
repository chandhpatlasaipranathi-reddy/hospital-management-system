package com.hospital.controller;

import com.hospital.entity.AppUser;
import com.hospital.repository.AppUserRepository;
import com.hospital.security.JwtService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    public AuthController(AppUserRepository users, PasswordEncoder encoder, AuthenticationManager authManager, JwtService jwtService) {
        this.users=users; this.encoder=encoder; this.authManager=authManager; this.jwtService=jwtService;
    }
    public record AuthRequest(@NotBlank String username, @NotBlank @Size(min=6, max=72) String password) {}
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String,String> register(@RequestBody AuthRequest request) {
        String username = request.username().trim();
        if (username.length() < 3) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username must be at least 3 characters");
        if (users.existsByUsername(username)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        users.save(new AppUser(username, encoder.encode(request.password())));
        return Map.of("message", "Registration successful. Please log in.");
    }
    @PostMapping("/login")
    public Map<String,String> login(@RequestBody AuthRequest request) {
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(request.username().trim(), request.password()));
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        return Map.of("token", jwtService.generate(request.username().trim()), "username", request.username().trim());
    }
}
