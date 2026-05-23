let soundEnabled = true;

function fetchFlights() {

    const lat = parseFloat(localStorage.getItem("homeLat"));
    const lon = parseFloat(localStorage.getItem("homeLon"));

    if (isNaN(lat) || isNaN(lon)) {
        document.getElementById("status").innerText = "NO DATA";
        return;
    }

        let nearestPlane = null;
        let nearestDistance = 999999;

        for (const plane of data.states) {

            const planeLat = plane[6];
            const planeLon = plane[5];

            if (planeLat == null || planeLon == null) {
                continue;
            }

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

function manualRefresh() {
    fetchFlights();
}

fetchFlights();

setInterval(fetchFlights, 60000);
