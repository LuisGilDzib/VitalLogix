package com.vitallogix.backend.observer;

import com.vitallogix.backend.model.Sale;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SaleEventNotifier {
    private final List<SaleObserver> observers;

    public SaleEventNotifier(List<SaleObserver> observers) {
        this.observers = observers;
    }

    public void notifyObservers(Sale sale) {
        for (SaleObserver observer : observers) {
            observer.onSaleCompleted(sale);
        }
    }
}
