package com.truthshield.backend;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Validates the "Authorization: Bearer <token>" header and, if the JWT is
 * valid, populates Spring Security's SecurityContext with an authenticated
 * principal (the user's email). SecurityConfig's .authorizeHttpRequests()
 * rules then decide, based on that context, whether the request is allowed
 * through — this filter itself never writes a 401 response; Spring
 * Security's own AuthenticationEntryPoint (configured in SecurityConfig)
 * handles that for any request that ends up unauthenticated.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.isTokenValid(token)) {
                String email = jwtUtil.extractEmail(token);
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                // Convenience for controllers that just want the email string
                // without pulling it out of the SecurityContext each time.
                request.setAttribute("authEmail", email);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Spring Boot auto-registers every Filter bean as a global servlet
     * filter. Since this filter is ALSO wired into the Spring Security
     * chain explicitly (SecurityConfig#addFilterBefore), we must disable
     * that automatic registration — otherwise the filter would run twice
     * per request.
     */
    @Configuration
    static class FilterRegistrationConfig {
        @Bean
        public FilterRegistrationBean<JwtAuthFilter> disableAutoRegistration(JwtAuthFilter filter) {
            FilterRegistrationBean<JwtAuthFilter> registrationBean = new FilterRegistrationBean<>(filter);
            registrationBean.setEnabled(false);
            return registrationBean;
        }
    }
}
