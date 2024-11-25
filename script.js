"use strict";

const workoutsContainer = document.querySelector(".list");
const workoutsForm = document.querySelector(".workouts .form");
const workoutTypeInput = document.querySelector(".form__input--type");
const distanceInput = document.querySelector(".form__input--distance");
const durationInput = document.querySelector(".form__input--duration");
const cadenceInput = document.querySelector(".form__input--cadence");
const elevationInput = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date();
  id = crypto.randomUUID();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  // setDescription for popup
}

class Cycling extends Workout {
  name = "cycling";
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation; // meter-> can be negative
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60); // km/h
    return this.speed;
  }
}

class Running extends Workout {
  name = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence; // step/min
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance; // min/km
    return this.pace;
  }
}

class App {
  #map;
  #mapEvent;
  #zoomLevel = 15;

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

    this.#map = L.map("map").setView(currentCoords, this.#zoomLevel);

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

    workoutsContainer.classList.remove("list--hidden");
    workoutsForm.classList.remove("hidden");

    setTimeout(() => distanceInput.focus(), 500);
    // distanceInput.focus();
  }

  _newWorkout(e) {
    e.preventDefault();

    // getting data
    const type = workoutTypeInput.value;
    const distance = distanceInput.value;
    const duration = durationInput.value;
    const { lat, lng } = this.#mapEvent.latlng;
    const clickedCoords = [lat, lng];

    // validate inputs with positivity

    // create workout

    //render on list

    //render on map
    L.marker(clickedCoords)
      .addTo(this.#map)
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

    // clear inputs

    // hide the form
  }

  _toggleWorkoutType() {
    elevationInput.closest(".form__row").classList.toggle("form__row--hidden");
    cadenceInput.closest(".form__row").classList.toggle("form__row--hidden");
    distanceInput.focus();
  }
}

const app = new App();
