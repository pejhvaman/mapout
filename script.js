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

  _setDescription() {
    const months = [
      "January",
      "Febuary",
      "March",
      "April",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.description = `${this.name[0].toUpperCase() + this.name.slice(1)} ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  name = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence; // step/min
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance; // min/km
    return this.pace;
  }
}
class Cycling extends Workout {
  name = "cycling";
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation; // meter-> can be negative
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60); // km/h
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #zoomLevel = 15;
  #workouts = [];

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
        this._renderErrMsg.bind(this, "We couldn't find your location! 🥵")
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

  _renderErrMsg(msg) {
    alert(`${msg} ⭕`);
  }

  _showForm(mapE) {
    if (!this.#mapEvent) this.#mapEvent = mapE;

    workoutsContainer.classList.remove("list--hidden");
    workoutsForm.classList.remove("hidden");

    setTimeout(() => distanceInput.focus(), 500);
    // distanceInput.focus();
  }

  _hideForm() {
    workoutsContainer.style.display = "none";
    workoutsContainer.classList.add("list--hidden");
    setTimeout(() => (workoutsContainer.style.display = "flex"), 300);
  }

  _newWorkout(e) {
    e.preventDefault();

    // getting data
    const type = workoutTypeInput.value;
    const distance = +distanceInput.value;
    const duration = +durationInput.value;
    const { lat, lng } = this.#mapEvent.latlng;
    const coords = [lat, lng];

    // validate inputs with positivity

    const isAllValid = function (...inputs) {
      return inputs.every((input) => isFinite(input));
    };

    const isAllPositive = function (...inputs) {
      return inputs.every((input) => input > 0);
    };

    let workout;
    if (type === "running") {
      const cadence = +cadenceInput.value;
      if (
        !isAllValid(distance, duration, cadence) ||
        !isAllPositive(distance, duration, cadence)
      )
        return this._renderErrMsg("Enter valid and positive numbers! 😡");

      workout = new Running(coords, distance, duration, cadence);
      this.#workouts.push(workout);
    }
    if (type === "cycling") {
      const elevation = +elevationInput.value;
      if (
        !isAllValid(distance, duration, elevation) ||
        !isAllPositive(distance, duration)
      )
        return this._renderErrMsg("Enter valid and positive numbers! 😡");

      workout = new Cycling(coords, distance, duration, elevation);
      this.#workouts.push(workout);
    }

    //render on list
    this._renderOnList(workout);

    //render on map
    L.marker(coords)
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

    // show controlBtns
    this._renderControlBtns();
  }

  _toggleWorkoutType() {
    elevationInput.closest(".form__row").classList.toggle("form__row--hidden");
    cadenceInput.closest(".form__row").classList.toggle("form__row--hidden");
    distanceInput.focus();
  }

  _renderControlBtns() {
    if (this.#workouts.length === 0 || document.querySelector(".controls"))
      return;
    const controlBtns = `
          <li class="controls">
            <div class="controls--deleteAll">
              <span class="controls--deleteAll__icon">❌</span>
              <span class="controls--deleteAll__title">delete all</span>
            </div>
          </li>
    `;

    workoutsForm.insertAdjacentHTML("beforebegin", controlBtns);
  }

  _renderOnList(workout) {
    let html = `
          <li class="workout workout--${workout.name}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${
                workout.name === "running" ? "🏃‍♂️" : "🚴‍♂️"
              }</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
    `;

    if (workout.name === "running")
      html += `
            <div class="workout__details">
              <span class="workout__icon">🦶🏼</span>
              <span class="workout__value">${workout.cadence}</span>
              <span class="workout__unit">spm</span>
            </div>
    `;
    if (workout.name === "cycling")
      html += `
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.elevation}</span>
              <span class="workout__unit">min/km</span>
            </div>
    `;

    html += `
            <div class="workout__details">
              <span class="workout__icon workout__delete">❌delete</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon workout__edit">✏edit</span>
            </div>
        </li>
    `;

    workoutsForm.insertAdjacentHTML("afterend", html);
  }
}

const app = new App();
