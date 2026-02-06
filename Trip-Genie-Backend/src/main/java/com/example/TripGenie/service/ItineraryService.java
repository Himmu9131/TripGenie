package com.example.TripGenie.service;

import com.example.TripGenie.dto.ItineraryRequest;
import com.example.TripGenie.dto.ItineraryResponse;
import com.example.TripGenie.model.entity.Itinerary;
import com.example.TripGenie.model.entity.User;
import com.example.TripGenie.repository.ItineraryRepository;
import com.example.TripGenie.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;
    private final TextProcessingService textProcessingService;

    public ItineraryResponse saveItinerary(Long userId, ItineraryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Itinerary itinerary = Itinerary.builder()
                .user(user)
                .destination(request.getDestination())
                .fullItinerary(request.getFullItinerary())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .numberOfDays(request.getNumberOfDays())
                .budgetRange(request.getBudgetRange())
                .travelStyle(request.getTravelStyle())
                .build();

        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        return mapToResponse(savedItinerary);
    }

    public List<ItineraryResponse> getUserItineraries(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Itinerary> itineraries = itineraryRepository.findByUserOrderByCreatedAtDesc(user);
        return itineraries.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ItineraryResponse getItineraryById(Long userId, Long itineraryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToResponse(itinerary);
    }

    public List<ItineraryResponse> searchItineraries(Long userId, String searchTerm) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String processedSearchTerm = textProcessingService.processText(searchTerm);
        List<Itinerary> itineraries=itineraryRepository.findByUserOrderByCreatedAtDesc(user);
        return itineraries.stream().filter(itinerary -> {
            String processedDestination = textProcessingService.processText(itinerary.getDestination());
            String processedItinerary = textProcessingService.processText(itinerary.getFullItinerary());
            return processedDestination.contains(processedSearchTerm) ||
                    processedItinerary.contains(processedSearchTerm);
        }).map(this::mapToResponse).collect(Collectors.toList());
    }

    public void deleteItinerary(Long userId, Long itineraryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        itineraryRepository.delete(itinerary);
    }

    private ItineraryResponse mapToResponse(Itinerary itinerary) {
        return ItineraryResponse.builder()
                .id(itinerary.getId())
                .destination(itinerary.getDestination())
                .fullItinerary(itinerary.getFullItinerary())
                .startDate(itinerary.getStartDate())
                .endDate(itinerary.getEndDate())
                .numberOfDays(itinerary.getNumberOfDays())
                .budgetRange(itinerary.getBudgetRange())
                .travelStyle(itinerary.getTravelStyle())
                .createdAt(itinerary.getCreatedAt())
                .updatedAt(itinerary.getUpdatedAt())
                .build();
    }
}
