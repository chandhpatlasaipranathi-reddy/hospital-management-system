package com.hospital.controller;

import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {
    private final PatientRepository repository;
    public PatientController(PatientRepository repository) { this.repository = repository; }

    @GetMapping public List<Patient> all() { return repository.findAll(); }
    @GetMapping("/{id}") public Patient get(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Patient create(@Valid @RequestBody Patient item) { return repository.save(item); }
    @PutMapping("/{id}") public Patient update(@PathVariable Long id, @Valid @RequestBody Patient item) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found");
        item.setId(id);
        return repository.save(item);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found");
        repository.deleteById(id);
    }
}
