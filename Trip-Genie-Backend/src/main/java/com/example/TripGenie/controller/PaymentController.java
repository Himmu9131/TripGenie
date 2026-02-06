package com.example.TripGenie.controller;

import com.example.TripGenie.dto.ApiResponse;
import com.example.TripGenie.dto.PaymentRequest;
import com.example.TripGenie.dto.PaymentResponse;
import com.example.TripGenie.model.entity.User;
import com.example.TripGenie.repository.UserRepository;
import com.example.TripGenie.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @Value("${stripe.public.key}")
    private String stripePublicKey;

    private String getAuthenticatedUsername(HttpServletRequest request) {
        return (String) request.getAttribute("authenticatedUsername");
    }

    private boolean validateUserAccess(String tokenUsername, Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return tokenUsername.equals(user.getUsername());
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            HttpServletRequest request,
            @Valid @RequestBody PaymentRequest paymentRequest) {

        try {
            String tokenUsername = getAuthenticatedUsername(request);
            if (paymentRequest.getUserId() != null &&
                    !validateUserAccess(tokenUsername, paymentRequest.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Token username does not match user"));
            }

            log.info("Processing payment request for user: {}", tokenUsername);

            PaymentResponse response = paymentService.processPayment(paymentRequest);

            if (response.isSuccess()) {
                return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", response));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(response.getErrorMessage()));
            }

        } catch (RuntimeException e) {
            log.error("Error processing payment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error processing payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error"));
        }
    }



    @GetMapping("/config")
    public ResponseEntity<ApiResponse<String>> getPaymentConfig() {
        // Return the public Stripe key for frontend configuration
        return ResponseEntity.ok(ApiResponse.success("Stripe public key retrieved", stripePublicKey));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Payment service is running", "OK"));
    }
}
