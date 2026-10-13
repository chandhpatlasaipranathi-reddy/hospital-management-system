package com.hospital.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
public class Patient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Column(nullable = false)
    private String fullName;
    @Min(0) @Max(125)
    private Integer age;
    private String gender;
    @Pattern(regexp = "^[0-9+() -]{7,20}$", message = "Enter a valid phone number")
    private String phone;
    private String email;
    private String address;

    public Patient() {}
    public Long getId(){return id;}
    public void setId(Long v){id=v;}
    public String getFullName(){return fullName;}
    public void setFullName(String v){fullName=v;}
    public Integer getAge(){return age;}
    public void setAge(Integer v){age=v;}
    public String getGender(){return gender;}
    public void setGender(String v){gender=v;}
    public String getPhone(){return phone;}
    public void setPhone(String v){phone=v;}
    public String getEmail(){return email;}
    public void setEmail(String v){email=v;}
    public String getAddress(){return address;}
    public void setAddress(String v){address=v;}
}
