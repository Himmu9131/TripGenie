package com.example.TripGenie.service.strategy;

import com.example.TripGenie.dto.PaymentRequest;
import com.example.TripGenie.dto.PaymentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CryptoPayments implements IPaymentStrategy {

    @Override
    public PaymentResponse processPayment(PaymentRequest paymentRequest) {
        log.info("Crypto payment processing not yet implemented for amount: {}", paymentRequest.getAmount());

        return PaymentResponse.failed("Cryptocurrency payments are not yet supported");
    }
}
