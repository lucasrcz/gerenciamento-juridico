package com.br.Juris.Enums;

public enum UserRole {

    ADMIN("ADMIN"),
    USER("USER");

    private String authority;

    UserRole(String authority){
        this.authority = this.authority;
    }

    public String getAuthority() {
        return authority;
    }
}
