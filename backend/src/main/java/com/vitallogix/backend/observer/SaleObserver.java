package com.vitallogix.backend.observer;

import com.vitallogix.backend.model.Sale;

public interface SaleObserver {
    void onSaleCompleted(Sale sale);
}
