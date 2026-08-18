package com.truthshield.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    // Injected from SecurityConfig's PasswordEncoder bean, not instantiated
    // locally — one BCrypt config for the whole app.
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public Map<String, String> signup(@RequestBody Map<String, String> body) {
        Map<String, String> res = new HashMap<>();
        String email = body.get("email");
        String password = body.get("password");
        String name = body.get("name");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            res.put("status", "error");
            res.put("message", "Email and password are required!");
            return res;
        }

        if (userRepo.findByEmail(email).isPresent()) {
            res.put("status", "error");
            res.put("message", "Email already exists!");
            return res;
        }

        // Password is hashed with BCrypt before storage — never stored in plaintext.
        String hashedPassword = passwordEncoder.encode(password);
        User user = new User(email, hashedPassword, name);
        userRepo.save(user);

        res.put("status", "success");
        res.put("message", "Account created!");
        res.put("name", name);
        res.put("email", email);
        res.put("token", jwtUtil.generateToken(email));
        return res;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) {
        Map<String, String> res = new HashMap<>();
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            res.put("status", "error");
            res.put("message", "Email not found!");
            return res;
        }

        User user = userOpt.get();
        // BCrypt comparison — never a plain .equals() on raw passwords.
        if (!passwordEncoder.matches(password, user.getPassword())) {
            res.put("status", "error");
            res.put("message", "Wrong password!");
            return res;
        }

        res.put("status", "success");
        res.put("message", "Login successful!");
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        res.put("token", jwtUtil.generateToken(email));
        return res;
    }
}
