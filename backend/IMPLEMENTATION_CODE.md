# Complete Implementation Code

This document contains all the Java code needed for the Spring Boot backend implementation.

## Security Components

###src/main/java/com/cosmetovigilance/security/JwtTokenProvider.java

```java
package com.cosmetovigilance.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userPrincipal.getId())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpirationMs);

        return Jwts.builder()
                .subject(userPrincipal.getId())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (SecurityException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }
}
```

### src/main/java/com/cosmetovigilance/security/JwtAuthenticationFilter.java

```java
package com.cosmetovigilance.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String userId = tokenProvider.getUserIdFromToken(jwt);

                UserDetails userDetails = userDetailsService.loadUserByUsername(userId);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### src/main/java/com/cosmetovigilance/security/UserPrincipal.java

```java
package com.cosmetovigilance.security;

import com.cosmetovigilance.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Data
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private String id;
    private String email;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_USER")
        );

        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
```

### src/main/java/com/cosmetovigilance/security/JwtAuthenticationEntryPoint.java

```java
package com.cosmetovigilance.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        log.error("Responding with unauthorized error. Message - {}", authException.getMessage());
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
    }
}
```

## Entities

### src/main/java/com/cosmetovigilance/entity/User.java

```java
package com.cosmetovigilance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(length = 36, updatable = false, nullable = false)
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### src/main/java/com/cosmetovigilance/entity/Declaration.java

```java
package com.cosmetovigilance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "declaration")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Declaration {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "declarant_id")
    private Declarant declarant;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "personne_exposee_id")
    private PersonneExposee personneExposee;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "declaration", cascade = CascadeType.ALL, orphanRemoval = true)
    private EffetIndesirable effetIndesirable;

    @OneToOne(mappedBy = "declaration", cascade = CascadeType.ALL, orphanRemoval = true)
    private PriseChargeMedicale priseChargeMedicale;

    @OneToOne(mappedBy = "declaration", cascade = CascadeType.ALL, orphanRemoval = true)
    private ProduitSuspecte produitSuspecte;

    @OneToMany(mappedBy = "declaration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### Additional Entities (Similar Pattern)

Create similar entity classes for:
- Declarant.java
- Utilisateur.java
- ProfessionnelSante.java
- RepresentantLegal.java
- PersonneExposee.java
- AllergiesConnues.java
- AntecedentsMedical.java
- MedicamentProduitSimultanement.java
- EffetIndesirable.java
- PriseChargeMedicale.java
- ProduitSuspecte.java
- Attachment.java

## DTOs

### src/main/java/com/cosmetovigilance/dto/request/LoginRequest.java

```java
package com.cosmetovigilance.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
```

### src/main/java/com/cosmetovigilance/dto/request/RegisterRequest.java

```java
package com.cosmetovigilance.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
```

### src/main/java/com/cosmetovigilance/dto/response/AuthResponse.java

```java
package com.cosmetovigilance.dto/response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private UserResponse user;

    public AuthResponse(String accessToken, String refreshToken, UserResponse user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }
}
```

### src/main/java/com/cosmetovigilance/dto/response/UserResponse.java

```java
package com.cosmetovigilance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String email;
}
```

## Repositories

### src/main/java/com/cosmetovigilance/repository/UserRepository.java

```java
package com.cosmetovigilance.repository;

import com.cosmetovigilance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
}
```

### src/main/java/com/cosmetovigilance/repository/DeclarationRepository.java

```java
package com.cosmetovigilance.repository;

import com.cosmetovigilance.entity.Declaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeclarationRepository extends JpaRepository<Declaration, String> {

    List<Declaration> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT d FROM Declaration d WHERE d.user.id = :userId ORDER BY d.createdAt DESC")
    List<Declaration> findUserDeclarations(String userId);
}
```

## Services

### src/main/java/com/cosmetovigilance/service/UserDetailsServiceImpl.java

```java
package com.cosmetovigilance.service;

import com.cosmetovigilance.entity.User;
import com.cosmetovigilance.repository.UserRepository;
import com.cosmetovigilance.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

        return UserPrincipal.create(user);
    }

    @Transactional
    public UserDetails loadUserByEmail(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return UserPrincipal.create(user);
    }
}
```

### src/main/java/com/cosmetovigilance/service/AuthService.java

```java
package com.cosmetovigilance.service;

import com.cosmetovigilance.dto.request.LoginRequest;
import com.cosmetovigilance.dto.request.RegisterRequest;
import com.cosmetovigilance.dto.response.AuthResponse;
import com.cosmetovigilance.dto.response.UserResponse;
import com.cosmetovigilance.entity.User;
import com.cosmetovigilance.repository.UserRepository;
import com.cosmetovigilance.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse userResponse = new UserResponse(user.getId(), user.getEmail());

        return new AuthResponse(accessToken, refreshToken, userResponse);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        UserResponse userResponse = new UserResponse(user.getId(), user.getEmail());

        return new AuthResponse(accessToken, refreshToken, userResponse);
    }
}
```

## Controllers

### src/main/java/com/cosmetovigilance/controller/AuthController.java

```java
package com.cosmetovigilance.controller;

import com.cosmetovigilance.dto.request.LoginRequest;
import com.cosmetovigilance.dto.request.RegisterRequest;
import com.cosmetovigilance.dto.response.AuthResponse;
import com.cosmetovigilance.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
}
```

## Exception Handling

### src/main/java/com/cosmetovigilance/exception/GlobalExceptionHandler.java

```java
package com.cosmetovigilance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid email or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(UsernameNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```
