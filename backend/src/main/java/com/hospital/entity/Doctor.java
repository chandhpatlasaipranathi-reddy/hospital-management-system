package com.hospital.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
public class Doctor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Column(nullable = false)
    private String fullName;
    @NotBlank @Column(nullable = false)
    private String specialization;
    private String phone;
    private String email;
    private String availableDays;

    public Doctor() {}
    public Long getId(){return id;}
    public void setId(Long v){id=v;}
    public String getFullName(){return fullName;}
    public void setFullName(String v){fullName=v;}
    public String getSpecialization(){return specialization;}
    public void setSpecialization(String v){specialization=v;}
    public String getPhone(){return phone;}
    public void setPhone(String v){phone=v;}
    public String getEmail(){return email;}
    public void setEmail(String v){email=v;}
    public String getAvailableDays(){return availableDays;}
    public void setAvailableDays(String v){availableDays=v;}
}
