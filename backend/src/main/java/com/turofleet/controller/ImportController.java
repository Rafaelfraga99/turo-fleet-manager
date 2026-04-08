package com.turofleet.controller;

import com.turofleet.service.CsvImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/import")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class ImportController {

    private final CsvImportService csvImportService;

    @PostMapping("/csv")
    public ResponseEntity<?> importCsv(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = csvImportService.importCsv(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
