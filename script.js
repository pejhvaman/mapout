"use strict";

const workoutsContainer = document.querySelector(".list");
const workoutsForm = document.querySelector(".workouts .form");

let map, mapEvent;
if (navigator.geolocation) {
  window.navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log(position);
      const { latitude, longitude } = position.coords;
      console.log(latitude, longitude);
      const currentCoords = [latitude, longitude];

      map = L.map("map").setView(currentCoords, 15);
      console.log(map);

      L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png").addTo(
        map
      );

      map.on("click", function (mapE) {
        mapEvent = mapE;
        console.log(mapEvent);

        // show the form
        workoutsContainer.classList.remove("list--hidden");
        workoutsForm.classList.remove("hidden");

        // focus on first input
      });

      workoutsForm.addEventListener("submit", function (e) {
        e.preventDefault();
        // produce a new workout

        // clear inputs

        // hide the form

        // show workout marker on map
        const { lat, lng } = mapEvent.latlng;
        const clickedCoords = [lat, lng];
        L.marker(clickedCoords)
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 200,
              minWidth: 50,
              maxHeight: 40,
              closeButton: true,
              autoClose: false,
              closeOnEscapeKey: false,
              closeOnClick: true,
              className: "leaflet-popup",
            })
          )
          .setPopupContent("New workout")
          .openPopup();
      });
    },
    function () {
      alert("We couldn't find your location!");
    }
  );
}
