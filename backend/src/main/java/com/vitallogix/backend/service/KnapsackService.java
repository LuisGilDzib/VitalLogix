package com.vitallogix.backend.service;

import com.vitallogix.backend.dto.KnapsackRequest;
import com.vitallogix.backend.dto.KnapsackResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class KnapsackService {

    public KnapsackResponse optimize(KnapsackRequest request) {
        List<KnapsackRequest.Item> items = request.getItems();
        int n = items.size();
        int capacity = request.getCapacity();

        int[][] dp = new int[n + 1][capacity + 1];

        for (int i = 1; i <= n; i++) {
            KnapsackRequest.Item current = items.get(i - 1);
            int weight = current.getWeight();
            int value = current.getValue();

            for (int w = 0; w <= capacity; w++) {
                dp[i][w] = dp[i - 1][w];
                if (weight <= w) {
                    int candidate = dp[i - 1][w - weight] + value;
                    if (candidate > dp[i][w]) {
                        dp[i][w] = candidate;
                    }
                }
            }
        }

        List<KnapsackResponse.SelectedItem> selected = new ArrayList<>();
        int remainingCapacity = capacity;
        int totalWeight = 0;

        for (int i = n; i > 0 && remainingCapacity >= 0; i--) {
            if (dp[i][remainingCapacity] != dp[i - 1][remainingCapacity]) {
                KnapsackRequest.Item item = items.get(i - 1);
                KnapsackResponse.SelectedItem selectedItem = new KnapsackResponse.SelectedItem();
                selectedItem.setId(item.getId());
                selectedItem.setName(item.getName());
                selectedItem.setWeight(item.getWeight());
                selectedItem.setValue(item.getValue());
                selected.add(selectedItem);

                remainingCapacity -= item.getWeight();
                totalWeight += item.getWeight();
            }
        }

        Collections.reverse(selected);

        KnapsackResponse response = new KnapsackResponse();
        response.setCapacity(capacity);
        response.setTotalValue(dp[n][capacity]);
        response.setTotalWeight(totalWeight);
        response.setSelectedItems(selected);
        return response;
    }
}
