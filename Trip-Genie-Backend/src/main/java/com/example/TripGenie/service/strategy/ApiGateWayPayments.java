package com.example.TripGenie.service.strategy;

/*
Strategy
factory
 */
public class ApiGateWayPayments implements IPaymentStrategy{
    @Override
    public boolean pay() {
        return false;
    }
}
