
package com.lingora;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            EngziOidcUserService oidcUserService,
            SecurityContextRepository contextRepository) throws Exception {

        http
            // APIs use JSON requests from the same-origin Engzi page.
            .csrf(csrf -> csrf.disable())

            .securityContext(context ->
                context.securityContextRepository(contextRepository)
            )

            .authorizeHttpRequests(auth ->
                auth.anyRequest().permitAll()
            )

            .oauth2Login(oauth -> oauth
                .userInfoEndpoint(userInfo ->
                    userInfo.oidcUserService(oidcUserService)
                )
                .defaultSuccessUrl("/?google=success", true)
                .failureUrl("/login?error=true")
            );

        return http.build();
    }
}
