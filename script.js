"use strict";

const workoutsContainer = document.querySelector(".list");
const workoutsForm = document.querySelector(".workouts .form");
const distanceInput = document.querySelector(".form__input--distance");
const workoutTypeInput = document.querySelector(".form__input--type");
const cadenceInput = document.querySelector(".form__input--cadence");
const elevationInput = document.querySelector(".form__input--elevation");

class App {
  #map;
  #mapEvent;
  constructor() {
    // get current position-> load map and attach handler to it
    this._getCurrentLocation.call(this);
    // submit handler to form
    workoutsForm.addEventListener("submit", this._newWorkout.bind(this));
    // change handler toggle elev and cadence inputs
    workoutTypeInput.addEventListener("change", this._toggleWorkoutType);
  }

  _getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        this._renderErrMsg.bind(this)
      );
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const currentCoords = [latitude, longitude];

    this.#map = L.map("map").setView(currentCoords, 15);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  _renderErrMsg() {
    alert(
      "We couldn't find your current location! Check your network or try in another country!"
    );
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;

    // show the list and form
    workoutsContainer.classList.remove("list--hidden");
    workoutsForm.classList.remove("hidden");

    // focus on first input
    distanceInput.focus();
  }

  _newWorkout(e) {
    e.preventDefault();
    // produce a new workout

    // clear inputs

    // hide the form

    // show workout marker on map
    const { lat, lng } = this.#mapEvent.latlng;
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
  }

  _toggleWorkoutType() {
    elevationInput.closest(".form__row").classList.toggle("form__row--hidden");
    cadenceInput.closest(".form__row").classList.toggle("form__row--hidden");
  }
}

const app = new App();
