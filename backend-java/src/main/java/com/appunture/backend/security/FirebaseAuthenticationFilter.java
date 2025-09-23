package com.appunture.backend.security;

import com.appunture.backend.service.FirebaseAuthService;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private final FirebaseAuthService firebaseAuthService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        // Skip authentication for public endpoints
        if (isPublicEndpoint(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = getTokenFromRequest(request);
        
        if (StringUtils.hasText(token) && firebaseAuthService.isAvailable()) {
            try {
                FirebaseToken decodedToken = firebaseAuthService.verifyToken(token);
                String uid = decodedToken.getUid();
                String email = decodedToken.getEmail();
                
                // Extrair role dos custom claims
                List<SimpleGrantedAuthority> authorities = extractAuthorities(decodedToken);
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(uid, null, authorities);
                
                // Adicionar informações extras ao contexto
                authentication.setDetails(new FirebaseAuthDetails(uid, email, decodedToken.getClaims()));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                log.debug("User authenticated: {} ({})", email, uid);
                
            } catch (Exception e) {
                log.error("Erro ao validar token Firebase: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                response.setContentType("application/json");
                return;
            }
        } else if (StringUtils.hasText(token)) {
            // Token fornecido mas Firebase não está disponível
            log.warn("Token provided but Firebase Auth not available");
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.getWriter().write("{\"error\":\"Authentication service unavailable\"}");
            response.setContentType("application/json");
            return;
        }
        
        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private List<SimpleGrantedAuthority> extractAuthorities(FirebaseToken token) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        Map<String, Object> claims = token.getClaims();
        if (claims.containsKey("role")) {
            String role = (String) claims.get("role");
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        } else {
            // Role padrão se não especificado
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        
        return authorities;
    }

    private boolean isPublicEndpoint(String uri) {
        return uri.startsWith("/api/public") ||
               uri.startsWith("/api/auth/register") ||
               uri.startsWith("/api/health") ||
               uri.startsWith("/swagger-ui") ||
               uri.startsWith("/v3/api-docs") ||
               uri.equals("/") ||
               uri.startsWith("/actuator");
    }

    /**
     * Classe para armazenar detalhes da autenticação Firebase
     */
    public static class FirebaseAuthDetails {
        private final String uid;
        private final String email;
        private final Map<String, Object> claims;

        public FirebaseAuthDetails(String uid, String email, Map<String, Object> claims) {
            this.uid = uid;
            this.email = email;
            this.claims = claims;
        }

        public String getUid() { return uid; }
        public String getEmail() { return email; }
        public Map<String, Object> getClaims() { return claims; }
    }
}