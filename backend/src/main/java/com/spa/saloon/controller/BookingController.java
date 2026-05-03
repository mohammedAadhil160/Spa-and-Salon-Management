package com.spa.saloon.controller;

import com.spa.saloon.model.Booking;
import com.spa.saloon.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping
    public Map<String, Object> createBooking(@RequestBody Booking booking) {
        Booking saved = bookingRepository.save(booking);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Booking confirmed successfully for " + saved.getName());
        response.put("booking", saved);
        return response;
    }

    @GetMapping
    public Iterable<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}
