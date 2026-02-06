package com.example.TripGenie.service.strategy;

import com.example.TripGenie.dto.PaymentRequest;
import com.example.TripGenie.dto.PaymentResponse;


public interface IPaymentStrategy {
    PaymentResponse processPayment(PaymentRequest paymentRequest);
}
