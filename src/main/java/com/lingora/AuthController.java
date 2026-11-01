package com.lingora;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;

    public AuthController(AppUserRepository users, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager, SecurityContextRepository contextRepository) {
        this.users = users; this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager; this.contextRepository = contextRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest body) {
        String email = body.email() == null ? "" : body.email().trim().toLowerCase();
        String password = body.password() == null ? "" : body.password();
        String name = body.name() == null ? "" : body.name().trim();
        if (!EMAIL.matcher(email).matches()) return error(HttpStatus.BAD_REQUEST, "Vui lòng nhập địa chỉ email hợp lệ.");
        if (password.length() < 8) return error(HttpStatus.BAD_REQUEST, "Mật khẩu cần có ít nhất 8 ký tự.");
        if (password.length() > 72) return error(HttpStatus.BAD_REQUEST, "Mật khẩu quá dài.");
        if (users.existsByEmailIgnoreCase(email)) return error(HttpStatus.CONFLICT, "Email này đã có tài khoản. Hãy đăng nhập.");
        AppUser user = new AppUser();
        user.setEmail(email); user.setPasswordHash(passwordEncoder.encode(password));
        user.setDisplayName(name.isBlank() ? email.substring(0, email.indexOf('@')) : name);
        user.setProvider("LOCAL");
        users.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "message", "Tạo tài khoản thành công. Bạn có thể đăng nhập.", "email", email));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest body, HttpServletRequest request, HttpServletResponse response) {
        String email = body.email() == null ? "" : body.email().trim().toLowerCase();
        String password = body.password() == null ? "" : body.password();
        if (email.isBlank() || password.isBlank()) return error(HttpStatus.BAD_REQUEST, "Vui lòng nhập email và mật khẩu.");
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, request, response);
            AppUser user = users.findByEmailIgnoreCase(email).orElseThrow();
            return ResponseEntity.ok(Map.of("status", "success", "message", "Đăng nhập thành công!",
                "email", user.getEmail(), "name", user.getDisplayName() == null ? "" : user.getDisplayName()));
        } catch (AuthenticationException ex) {
            SecurityContextHolder.clearContext();
            return error(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu chưa đúng. Nếu dùng Google, hãy chọn Tiếp tục với Google.");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("status", "error", "message", "Bạn chưa đăng nhập."));
        }
        String email = authentication.getName();
        AppUser user = users.findByEmailIgnoreCase(email).orElse(null);
        return ResponseEntity.ok(Map.of("status", "success", "email", email, "name", user == null || user.getDisplayName() == null ? "" : user.getDisplayName()));
    }

    @PostMapping("/logout")
    public Map<String, String> logout(Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return Map.of("status", "success", "message", "Đã đăng xuất.");
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("status", "error", "message", message));
    }
    public record AuthRequest(String email, String password, String name) {}
}
