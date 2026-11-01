package com.lingora;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EngziOidcUserService extends OidcUserService {
    private final AppUserRepository users;
    public EngziOidcUserService(AppUserRepository users) { this.users = users; }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
        OidcUser oidc = super.loadUser(request);
        String email = oidc.getEmail();
        Boolean verified = oidc.getClaimAsBoolean("email_verified");
        if (email == null || email.isBlank() || !Boolean.TRUE.equals(verified)) {
            throw new OAuth2AuthenticationException("Google chưa xác minh địa chỉ email.");
        }
        AppUser user = users.findByEmailIgnoreCase(email).orElseGet(AppUser::new);
        user.setEmail(email.trim().toLowerCase());
        String name = oidc.getFullName();
        if (name == null || name.isBlank()) name = email.substring(0, email.indexOf('@'));
        user.setDisplayName(name);
        if (user.getPasswordHash() == null) user.setProvider("GOOGLE");
        users.save(user);
        return oidc;
    }
}
