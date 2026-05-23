console.log("JS LOADED");

let soundEnabled = true;

const ping = new Audio("ping.mp3");

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function playPing() {
    if (soundEnabled) {
        ping.currentTime = 0;
        ping.play();
    }
}

async function fetchFlights() {

    const lat = parseFloat(localStorage.getItem("homeLat"));
    const lon = parseFloat(localStorage.getItem("homeLon"));

    if (isNaN(lat) || isNaN(lon)) {
        document.getElementById("status").innerText = "NO DATA";
        return;
    }

    try {

        const url = "https://opensky-network.org/api/states/all";
        const response = await fetch(url);
        const data = await response.json();

        if (!data.states) {
            document.getElementById("status").innerText = "NO AIRCRAFT DATA";
            return;
        }

        let nearestPlane = null;
        let nearestDistance = 999999;

        for (const plane of data.states) {

            const planeLat = plane[6];
            const planeLon = plane[5];

            if (planeLat == null || planeLon == null) continue;

            const dist = haversine(lat, lon, planeLat, planeLon);

            if (dist < nearestDistance) {
                nearestDistance = dist;
                nearestPlane = plane;
            }
        }

        if (nearestPlane) {

            const callsign = nearestPlane[1]?.trim() || "UNKNOWN";
            const country = nearestPlane[2] || "UNKNOWN";
            const altitude = nearestPlane[7]
                ? Math.round(nearestPlane[7]) + " m"
                : "UNKNOWN";

            const velocity = nearestPlane[9]
                ? Math.round(nearestPlane[9] * 3.6) + " km/h"
                : "UNKNOWN";

            document.getElementById("callsign").innerText = callsign;
            document.getElementById("country").innerText = country;
            document.getElementById("altitude").innerText = altitude;
            document.getElementById("speed").innerText = velocity;
            document.getElementById("distance").innerText =
                nearestDistance.toFixed(1) + " km";

            document.getElementById("status").innerText =
                "TRACKING NEAREST AIRCRAFT";

            if (nearestDistance < 50) {
                playPing();
            }

        } else {
            document.getElementById("status").innerText = "NO AIRCRAFT FOUND";
        }

    } catch (err) {

        console.error(err);

        document.getElementById("status").innerText =
            "ERROR FETCHING DATA";
    }
}

function saveLocation() {
    const lat = document.getElementById("latInput").value;
    const lon = document.getElementById("lonInput").value;

    localStorage.setItem("homeLat", lat);
    localStorage.setItem("homeLon", lon);

    document.getElementById("status").innerText = "LOCATION SAVED";
}

function toggleSound() {
    soundEnabled = !soundEnabled;
}

function manualRefresh() {
    fetchFlights();
}

fetchFlights();
setInterval(fetchFlights, 60000);
