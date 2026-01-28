// Global variables
let isRecording = false;
let recognition = null;
const AUTH_ITINERARY_PATH = '';

// Carousel functionality
let currentSlide = 0;
let autoSlideInterval;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;


// Initialize speech recognition
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('voiceResult').value = transcript;
            document.getElementById('voiceStatus').textContent = 'Voice captured successfully!';
            performVoiceSearch();
        };  

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            document.getElementById('voiceStatus').textContent = 'Error: ' + event.error;
        };

        recognition.onend = function() {
            isRecording = false;
            document.getElementById('voiceIcon').classList.remove('recording');
            document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
        };
    }
}

// Search interface management functions
function activateAISearch() {
    hideAllInterfaces();
    document.getElementById('aiSearchInterface').style.display = 'block';
    document.getElementById('aiSearchBtn').style.display = 'none';
}

function activateVoiceSearch() {
    hideAllInterfaces();
    document.getElementById('voiceSearchInterface').style.display = 'block';
    document.getElementById('voiceSearchBtn').style.display = 'none';
}

function activateManualSearch() {
    hideAllInterfaces();
    document.getElementById('manualSearchInterface').style.display = 'block';
    document.getElementById('manualSearchBtn').style.display = 'none';
}

function hideAllInterfaces() {
    const interfaces = ['aiSearchInterface', 'voiceSearchInterface', 'manualSearchInterface'];
    const buttons = ['aiSearchBtn', 'voiceSearchBtn', 'manualSearchBtn'];
    
    interfaces.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    buttons.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'block';
    });
}

// Voice recording functions
function toggleVoiceRecording() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser.');
        return;
    }

    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
        isRecording = true;
        document.getElementById('voiceIcon').classList.add('recording');
        document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
        document.getElementById('voiceStatus').textContent = 'Listening...';
    }
}

// Search functions

async function performVoiceSearch() {
    const query = document.getElementById('voiceResult').value;
    if (query.trim()) {
        showLoadingState();
        try {
            const aiResponse = await generateTripSuggestions(query);
            showResults(`<h4>Search Results for: "${query}"</h4><br>${aiResponse}`);
        } catch (error) {
            showResults(`<h4>Search Results for: "${query}"</h4><br><p>Here are some general suggestions for your trip...</p>`);
        }
    }
}

async function performSearch() {
    const query = document.getElementById('mainSearch').value;
    if (query.trim()) {
        
        try {
            const aiResponse = await generateTripSuggestions(query);
            showResults(`<h4>Search Results for: "${query}"</h4><br>${aiResponse}`);
        } catch (error) {
            showResults(`<h4>Search Results for: "${query}"</h4><br><p>Here are some general suggestions for your trip...</p>`);
        }
    }
}

async function performManualSearch() {
    const destination = document.getElementById('destination').value;
    const duration = document.getElementById('duration').value;
    const budget = document.getElementById('budget').value;
    const style = document.getElementById('travelStyle').value;

    if (destination.trim()) {
        showLoadingState();
        const searchQuery = `Destination: ${destination}, Duration: ${duration} days, Budget: $${budget}, Style: ${style}`;
        
        try {
            const aiResponse = await generateTripSuggestions(searchQuery);
            showResults(`<h4>Manual Search Results</h4><br><p><strong>Search Criteria:</strong> ${searchQuery}</p><br>${aiResponse}`);
        } catch (error) {
            showResults(`<h4>Manual Search Results</h4><br><p><strong>Search Criteria:</strong> ${searchQuery}</p><br><p>Here are some suggestions based on your criteria...</p>`);
        }
    }
}

// generate trip suggestions by calling open ai
async function generateTripSuggestions(userInput) {
    try{
        const systemPrompt = `You are a travel advisor. Provide a concise response with ONLY the following information in this exact format:

        DESTINATION: [Main destination name]
        DURATION: [Suggested trip duration]
        BUDGET: [Estimated budget range]
        BEST_TIME: [Best time to visit]
        TOP_ATTRACTIONS: [List 3-4 main attractions, separated by semicolons]
        ACCOMMODATION: [Brief accommodation recommendation]
        LOCAL_FOOD: [2-3 must-try local dishes, separated by semicolons]
        TRAVEL_TIP: [One important travel tip]

        Keep each section brief and specific. Do not include extra formatting or explanations.`;

        const userPrompt = `Please provide essential travel information for:${userInput}`;

        const response = await callGitHubAI(`${systemPrompt}\n\nUser Request: ${userPrompt}`);
        console.log(response);
        // return formatTripResponse(response);
    }catch (error) {
        console.error('Error generating trip suggestions:', error);
        throw error;
    }
       
}

// UI helper functions
function showLoadingState() {
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Generating personalized travel suggestions...</p>
        </div>
    `;
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
}

function showResults(content) {
    document.getElementById('resultsContent').innerHTML = content;
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
}


// Initialize carousel
function initCarousel() {
    createDots();
    startAutoSlide();
    updateCarousel();
}

// Create navigation dots
function createDots() {
    const dotsContainer = document.getElementById('carouselDots');
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
}

// Move carousel
function moveCarousel(direction) {
    currentSlide += direction;
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    updateCarousel();
    
}

// Go to specific slide
function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
    
}

// Update carousel display
function updateCarousel() {
    const track = document.getElementById('countryCarousel');
    const slideWidth = 320; // 300px width + 20px gap
    const offset = -currentSlide * slideWidth;
    track.style.transform = `translateX(${offset}px)`;
    
    // Update dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Start auto-sliding
function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        moveCarousel(1);
    }, 3000); // Change slide every 3 seconds
}

// Export functions for global access (if needed)
window.travelApp = {
    performSearch,
    initCarousel,
    performManualSearch,
    toggleVoiceRecording,
    activateAISearch,
    activateVoiceSearch,
    activateManualSearch
};