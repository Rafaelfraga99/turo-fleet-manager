package com.turofleet.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.turofleet.model.Trip;
import com.turofleet.model.Vehicle;
import com.turofleet.repository.TripRepository;
import com.turofleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CsvImportService {

    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");
    private static final Pattern PLATE_PATTERN = Pattern.compile("\\(FL #([^)]+)\\)");
    private static final Pattern VEHICLE_NAME_PATTERN = Pattern.compile("^(.+?)\\s+(\\d{4})$");

    public Map<String, Object> importCsv(MultipartFile file) throws IOException, CsvValidationException {
        int tripsImported = 0;
        int vehiclesCreated = 0;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] header = reader.readNext();
            if (header == null) throw new IOException("CSV file is empty");

            Map<String, Integer> col = new HashMap<>();
            for (int i = 0; i < header.length; i++) {
                col.put(header[i].trim().replace("\"", ""), i);
            }

            String[] line;
            while ((line = reader.readNext()) != null) {
                String reservationId = get(line, col, "Reservation ID");
                if (reservationId == null) continue;

                if (tripRepository.findByReservationId(reservationId).isPresent()) continue;

                String turoVehicleId = get(line, col, "Vehicle id");
                String vin = get(line, col, "VIN");
                String vehicleCol = get(line, col, "Vehicle");
                String vehicleNameCol = get(line, col, "Vehicle name");

                Vehicle vehicle = vehicleRepository.findByTuroVehicleId(turoVehicleId)
                        .orElseGet(() -> {
                            Vehicle v = new Vehicle();
                            v.setTuroVehicleId(turoVehicleId);
                            v.setVin(vin);
                            v.setListingName(vehicleCol);

                            String plate = extractPlate(vehicleCol);
                            v.setLicensePlate(plate);

                            if (vehicleNameCol != null) {
                                v.setVehicleName(vehicleNameCol);
                                Matcher m = VEHICLE_NAME_PATTERN.matcher(vehicleNameCol);
                                if (m.matches()) {
                                    String[] parts = m.group(1).split("\\s+", 2);
                                    v.setMake(parts[0]);
                                    v.setModel(parts.length > 1 ? parts[1] : "");
                                    v.setYear(Integer.parseInt(m.group(2)));
                                } else {
                                    v.setMake(vehicleNameCol);
                                    v.setModel("");
                                    v.setYear(0);
                                }
                            } else {
                                v.setMake("Unknown");
                                v.setModel("");
                                v.setYear(0);
                            }

                            return vehicleRepository.save(v);
                        });

                Trip trip = Trip.builder()
                        .reservationId(reservationId)
                        .guest(get(line, col, "Guest"))
                        .vehicle(vehicle)
                        .tripStart(parseDate(get(line, col, "Trip start")))
                        .tripEnd(parseDate(get(line, col, "Trip end")))
                        .pickupLocation(get(line, col, "Pickup location"))
                        .returnLocation(get(line, col, "Return location"))
                        .tripStatus(get(line, col, "Trip status"))
                        .checkInOdometer(parseInteger(get(line, col, "Check-in odometer")))
                        .checkOutOdometer(parseInteger(get(line, col, "Check-out odometer")))
                        .distanceTraveled(parseInteger(get(line, col, "Distance traveled")))
                        .tripDays(parseInteger(get(line, col, "Trip days")))
                        .tripPrice(parseMoney(get(line, col, "Trip price")))
                        .boostPrice(parseMoney(get(line, col, "Boost price")))
                        .threeDayDiscount(parseMoney(get(line, col, "3-day discount")))
                        .oneWeekDiscount(parseMoney(get(line, col, "1-week discount")))
                        .twoWeekDiscount(parseMoney(get(line, col, "2-week discount")))
                        .threeWeekDiscount(parseMoney(get(line, col, "3-week discount")))
                        .oneMonthDiscount(parseMoney(get(line, col, "1-month discount")))
                        .twoMonthDiscount(parseMoney(get(line, col, "2-month discount")))
                        .threeMonthDiscount(parseMoney(get(line, col, "3-month discount")))
                        .nonRefundableDiscount(parseMoney(get(line, col, "Non-refundable discount")))
                        .earlyBirdDiscount(parseMoney(get(line, col, "Early bird discount")))
                        .hostPromotionalCredit(parseMoney(get(line, col, "Host promotional credit")))
                        .delivery(parseMoney(get(line, col, "Delivery")))
                        .excessDistance(parseMoney(get(line, col, "Excess distance")))
                        .extras(parseMoney(get(line, col, "Extras")))
                        .cancellationFee(parseMoney(get(line, col, "Cancellation fee")))
                        .additionalUsage(parseMoney(get(line, col, "Additional usage")))
                        .lateFee(parseMoney(get(line, col, "Late fee")))
                        .improperReturnFee(parseMoney(get(line, col, "Improper return fee")))
                        .airportOperationsFee(parseMoney(get(line, col, "Airport operations fee")))
                        .airportParkingCredit(parseMoney(get(line, col, "Airport parking credit")))
                        .tollsAndTickets(parseMoney(get(line, col, "Tolls & tickets")))
                        .onTripEvCharging(parseMoney(get(line, col, "On-trip EV charging")))
                        .postTripEvCharging(parseMoney(get(line, col, "Post-trip EV charging")))
                        .smoking(parseMoney(get(line, col, "Smoking")))
                        .cleaning(parseMoney(get(line, col, "Cleaning")))
                        .finesPaidToHost(parseMoney(get(line, col, "Fines (paid to host)")))
                        .gasReimbursement(parseMoney(get(line, col, "Gas reimbursement")))
                        .gasFee(parseMoney(get(line, col, "Gas fee")))
                        .otherFees(parseMoney(get(line, col, "Other fees")))
                        .salesTax(parseMoney(get(line, col, "Sales tax")))
                        .totalEarnings(parseMoney(get(line, col, "Total earnings")))
                        .build();

                tripRepository.save(trip);
                tripsImported++;
            }
        }

        vehiclesCreated = (int) vehicleRepository.count();
        return Map.of(
                "tripsImported", tripsImported,
                "vehiclesFound", vehiclesCreated,
                "message", "Import completed successfully"
        );
    }

    private String get(String[] line, Map<String, Integer> col, String column) {
        Integer idx = col.get(column);
        if (idx == null || idx >= line.length) return null;
        String val = line[idx].trim().replace("\"", "");
        return val.isEmpty() ? null : val;
    }

    private String extractPlate(String vehicleCol) {
        if (vehicleCol == null) return null;
        Matcher m = PLATE_PATTERN.matcher(vehicleCol);
        return m.find() ? m.group(1) : null;
    }

    private LocalDateTime parseDate(String val) {
        if (val == null) return null;
        try {
            return LocalDateTime.parse(val, DATE_FMT);
        } catch (Exception e) {
            return null;
        }
    }

    private Integer parseInteger(String val) {
        if (val == null) return null;
        try {
            return Integer.parseInt(val.replace(",", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal parseMoney(String val) {
        if (val == null) return BigDecimal.ZERO;
        try {
            String cleaned = val.replace("$", "").replace(",", "").replace(" ", "").trim();
            if (cleaned.isEmpty()) return BigDecimal.ZERO;
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }
}
