let map;
let userLocation = null;
let markers = [];
let restaurants = [];

document.addEventListener("DOMContentLoaded", () => {
    setupSortButtons();
    setupSearch();
});

function initMap() {
    console.log("Initializing map...");
    
    const defaultLocation = { lat: 3.139, lng: 101.686 };
    
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: defaultLocation,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false
    });

    document.getElementById("restaurantList").innerHTML = '<div class="loading">Finding real restaurants near you...</div>';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                console.log("Your location:", userLocation);
                map.setCenter(userLocation);
                
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "You are here",
                    icon: {
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });

                searchRealRestaurants(userLocation);
            },
            (error) => {
                console.log("Location error, using default");
                searchRealRestaurants(defaultLocation);
            }
        );
    } else {
        searchRealRestaurants(defaultLocation);
    }
}

function searchRealRestaurants(location) {
    console.log("Searching real restaurants...");
    
    const service = new google.maps.places.PlacesService(map);
    
    const request = {
        location: location,
        radius: 1500,
        type: 'restaurant'
    };

    service.nearbySearch(request, (results, status) => {
        console.log("Places API status:", status);
        
        if (status === "OK" && results.length > 0) {
            console.log(`✅ Found ${results.length} real restaurants!`);
            
            restaurants = results.map(place => ({
                id: place.place_id,
                name: place.name,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                price: place.price_level ? place.price_level * 10 : 15,
                rating: place.rating || 4.0,
                vicinity: place.vicinity || "Address available",
                distance: calculateDistance(location, {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                })
            }));

            sortByDistance();
            showMessage(`Found ${restaurants.length} real restaurants!`);
        } else {
            console.log("Using mock data as fallback");
            loadMockRestaurants(location);
        }
    });
}

function loadMockRestaurants(location) {
    console.log("Using mock data as fallback");
    
    restaurants = [
        {
            id: "1",
            name: "Starbucks Coffee",
            lat: location.lat + 0.001,
            lng: location.lng + 0.001,
            price: 18,
            rating: 4.5,
            vicinity: "123 Main Street",
            distance: 0.2
        },
        {
            id: "2",
            name: "McDonald's",
            lat: location.lat - 0.001,
            lng: location.lng + 0.002,
            price: 12,
            rating: 4.0,
            vicinity: "45 Second Avenue",
            distance: 0.4
        },
        {
            id: "3",
            name: "Pizza Hut",
            lat: location.lat + 0.002,
            lng: location.lng - 0.001,
            price: 25,
            rating: 4.2,
            vicinity: "78 Third Street",
            distance: 0.6
        },
        {
            id: "4",
            name: "Subway",
            lat: location.lat - 0.002,
            lng: location.lng - 0.001,
            price: 10,
            rating: 4.3,
            vicinity: "32 Fourth Road",
            distance: 0.8
        },
        {
            id: "5",
            name: "KFC",
            lat: location.lat + 0.001,
            lng: location.lng - 0.002,
            price: 15,
            rating: 4.1,
            vicinity: "15 Fifth Lane",
            distance: 1.0
        }
    ];

    sortByDistance();
    showMessage("Demo mode - showing sample restaurants");
}

function showTopThree(data) {
    const listContainer = document.getElementById("restaurantList");
    
    if (!data || data.length === 0) {
        listContainer.innerHTML = '<div class="no-results">No restaurants found 🍽️</div>';
        return;
    }

    const activeSort = document.querySelector('.sort-btn.active')?.id || 'sortDistance';
    
    const sorted = [...data].sort((a, b) => {
        if (activeSort === 'sortDistance') return a.distance - b.distance;
        if (activeSort === 'sortPrice') return a.price - b.price;
        if (activeSort === 'sortRating') return b.rating - a.rating;
        return 0;
    }).slice(0, 3);

    listContainer.innerHTML = "<h3 style='margin: 0 0 15px 0; color: #333;'>🏆 Top 3 Restaurants</h3>";

    sorted.forEach((r, index) => {
        let rankEmoji = '';
        let rankColor = '';
        let rankText = '';
        
        if (index === 0) {
            rankEmoji = '🥇';
            rankColor = '#FFD700';
            rankText = 'BEST';
        } else if (index === 1) {
            rankEmoji = '🥈';
            rankColor = '#C0C0C0';
            rankText = '2ND';
        } else {
            rankEmoji = '🥉';
            rankColor = '#CD7F32';
            rankText = '3RD';
        }

        const card = document.createElement("div");
        card.className = "restaurant-card";
        card.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 12px;
            border-left: 5px solid ${rankColor};
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            cursor: pointer;
        `;

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: ${rankColor}; width: 40px; height: 40px; 
                            border-radius: 50%; display: flex; align-items: center; 
                            justify-content: center; font-size: 20px; color: ${index === 0 ? '#000' : '#fff'};">
                    ${rankEmoji}
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between;">
                        <h3 style="margin: 0; font-size: 18px;">${r.name}</h3>
                        <span style="background: ${rankColor}; color: ${index === 0 ? '#000' : '#fff'}; 
                                    padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                            ${rankText}
                        </span>
                    </div>
                    <div style="display: flex; gap: 20px; margin-top: 8px; font-size: 14px; color: #666;">
                        <span>💰 RM${r.price}</span>
                        <span>⭐ ${r.rating}</span>
                        <span>📍 ${r.distance.toFixed(1)}km</span>
                    </div>
                    <div style="font-size: 13px; color: #999; margin-top: 5px;">
                        ${r.vicinity}
                    </div>
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            map.panTo({ lat: r.lat, lng: r.lng });
            map.setZoom(16);
        });

        listContainer.appendChild(card);
    });

    clearMarkers();
    sorted.forEach(r => {
        const marker = new google.maps.Marker({
            position: { lat: r.lat, lng: r.lng },
            map: map,
            title: r.name
        });
        markers.push(marker);
    });
}

function clearMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}

function setupSortButtons() {
    document.getElementById("sortDistance").addEventListener("click", () => {
        setActive("sortDistance");
        sortByDistance();
        showMessage("Showing 3 closest restaurants");
    });

    document.getElementById("sortPrice").addEventListener("click", () => {
        setActive("sortPrice");
        sortByPrice();
        showMessage("Showing 3 cheapest restaurants");
    });

    document.getElementById("sortRating").addEventListener("click", () => {
        setActive("sortRating");
        sortByRating();
        showMessage("Showing 3 highest rated restaurants");
    });
}

function setupSearch() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    
    if (!searchBtn || !searchInput) return;
    
    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") performSearch();
    });
}

function performSearch() {
    const searchInput = document.getElementById("searchInput");
    const keyword = searchInput.value.toLowerCase().trim();
    
    if (!keyword) {
        const activeSort = document.querySelector('.sort-btn.active')?.id || 'sortDistance';
        if (activeSort === 'sortDistance') sortByDistance();
        else if (activeSort === 'sortPrice') sortByPrice();
        else if (activeSort === 'sortRating') sortByRating();
        return;
    }

    const filtered = restaurants.filter(r => 
        r.name.toLowerCase().includes(keyword)
    );
    
    if (filtered.length > 0) {
        showTopThree(filtered);
        showMessage(`Found ${filtered.length} results for "${keyword}"`);
    } else {
        const listContainer = document.getElementById("restaurantList");
        listContainer.innerHTML = `
            <div class="no-results">
                <div class="emoji">🔍</div>
                <p>No restaurants found matching "${keyword}"</p>
                <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 20px; background: #4CAF50; color: white; border: none; border-radius: 25px; cursor: pointer;">Show All</button>
            </div>
        `;
        
        clearMarkers();
        
        showMessage(`No results for "${keyword}"`);
    }
}

function sortByDistance() {
    if (!restaurants.length) return;
    const sorted = [...restaurants].sort((a, b) => a.distance - b.distance);
    showTopThree(sorted);
}

function sortByPrice() {
    if (!restaurants.length) return;
    const sorted = [...restaurants].sort((a, b) => a.price - b.price);
    showTopThree(sorted);
}

function sortByRating() {
    if (!restaurants.length) return;
    const sorted = [...restaurants].sort((a, b) => b.rating - a.rating);
    showTopThree(sorted);
}

function setActive(id) {
    document.querySelectorAll(".sort-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function showMessage(text) {
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px;
        border-radius: 8px;
        text-align: center;
        z-index: 1000;
    `;
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

function calculateDistance(user, place) {
    const R = 6371;
    const dLat = (place.lat - user.lat) * Math.PI / 180;
    const dLng = (place.lng - user.lng) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(user.lat * Math.PI/180) * Math.cos(place.lat * Math.PI/180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}