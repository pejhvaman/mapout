"use strict";

import Running from "./Running";
import Cycling from "./Cycling";

import { isAllValid, isAllPositive } from "./helpers";

const workoutsContainer = document.querySelector(".list");
const workoutsList = document.querySelector(".workouts");
const workoutsForm = document.querySelector(".form");
// const workoutsEl = document.querySelec torAll(".workout");
const workoutTypeInput = document.querySelector(".form__input--type");
const distanceInput = document.querySelector(".form__input--distance");
const durationInput = document.querySelector(".form__input--duration");
const cadenceInput = document.querySelector(".form__input--cadence");
const elevationInput = document.querySelector(".form__input--elevation");
const closeBtn = document.querySelector(".close");
const startBtn = document.querySelector(".start-btn");

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

    closeBtn.addEventListener("click", this._hideForm);
    closeBtn.addEventListener("click", this._showStartBtn);

    workoutsList.addEventListener(
      "click",
      this._handleWorkoutActions.bind(this)
    );

    startBtn.addEventListener("click", this._showWorkouts.bind(this));
  }

  _showWorkouts() {
    this._showForm();
    this._hideFormFields();
  }

  _hideFormFields() {
    workoutsForm?.classList.add("hidden");
    this._renderAddWorkoutMsg();
  }

  _renderAddWorkoutMsg() {
    const helperMsg =
      '<p class="helper-msg__new-workout">Click on the map to add a new workout!</p>';
    workoutsForm.insertAdjacentHTML("afterend", helperMsg);
  }

  _removeAddWorkoutMsg() {
    document.querySelector(".helper-msg__new-workout")?.remove();
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
    this.#map.on("click", this._hideStartBtn.bind(this));
    this.#map.on("move", this._hideForm);

    this._getStoredWorkouts();
  }

  _hideStartBtn() {
    startBtn.classList.add("hidden");
  }

  _showStartBtn() {
    startBtn.classList.remove("hidden");
  }

  _renderErrMsg(msg) {
    alert(`${msg} ⭕`);
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;

    workoutsContainer.classList.remove("list--hidden");
    workoutsForm.classList.remove("hidden");

    this._renderControlBtns();

    setTimeout(() => distanceInput.focus(), 500);

    this._hideStartBtn();
    this._removeAddWorkoutMsg();
  }

  _hideForm() {
    // workoutsForm.style.display = "none";
    workoutsForm.classList.add("hidden");
    // setTimeout(() => (workoutsForm.style.display = "grid"), 300);

    workoutsContainer.classList.add("list--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // getting data
    const type = workoutTypeInput.value;
    const distance = +distanceInput.value;
    const duration = +durationInput.value;
    // if (!this.#mapEvent || !this.#mapEvent.latlng)
    //   console.error("click on the map to add a new workout");

    const { lat, lng } = this.#mapEvent?.latlng;
    const coords = [lat, lng];

    // validate inputs with positivite
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

    this._renderOnList(workout);

    this._renderOnMap(workout);

    this._storeWorkouts();

    this._clearFormInputs();

    this._moveToWorkout(workout.id);

    this._renderControlBtns();
  }

  _clearFormInputs() {
    distanceInput.value =
      durationInput.value =
      cadenceInput.value =
      elevationInput.value =
        "";
  }

  _toggleWorkoutType() {
    elevationInput.closest(".form__row").classList.toggle("form__row--hidden");
    cadenceInput.closest(".form__row").classList.toggle("form__row--hidden");
    distanceInput.focus();
  }

  _renderControlBtns() {
    if (this.#workouts.length === 0 && document.querySelector(".controls")) {
      // console.log(this.#workouts);
      document
        .querySelector(".controls")
        ?.querySelector(".controls--deleteAll")
        ?.remove();
    } else if (
      this.#workouts.length > 0 &&
      !document.querySelector(".controls")
    ) {
      const controlBtns = `
      <li class="controls">
      <div></div>
      <div></div>
      <div class="controls--deleteAll">
      <span class="controls--deleteAll__title">Delete all</span>
      </div>
      </li>
      `;

      workoutsForm.insertAdjacentHTML("afterend", controlBtns);

      const controlBtnEl = document.querySelector(".controls");
      controlBtnEl.addEventListener("click", this.reset);
    }
  }

  _renderOnList(workout) {
    let html = "";
    html += `
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
              <span class="workout__delete">✖ Delete</span>
            </div>
            <div class="workout__details">
              <span class="workout__edit">📝 Edit</span>
            </div>
        </li>
    `;

    workoutsList.insertAdjacentHTML("beforeend", html);
  }

  _renderOnMap(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 50,
          maxHeight: 40,
          closeButton: true,
          autoClose: false,
          closeOnEscapeKey: false,
          closeOnClick: false,
          className: `leaflet-popup ${workout.name}-popup`,
        })
      )
      .setPopupContent(`${workout.description}`)
      .openPopup()
      .on("click", this._moveToWorkout.bind(this, workout.id));
  }

  _handleWorkoutActions(e) {
    const workoutTarget = e.target.closest(".workout");

    const workoutId = workoutTarget?.dataset.id;

    const deleteWorkoutBtn = e.target.closest(".workout__delete");

    const editWorkoutBtn = e.target.closest(".workout__edit");

    if (workoutTarget && !deleteWorkoutBtn && !editWorkoutBtn) {
      this._moveToWorkout(workoutTarget?.dataset.id);
    }

    if (deleteWorkoutBtn) {
      this._deleteWorkout(workoutId);
    }

    if (editWorkoutBtn) {
      console.log("edit");
    }
  }

  _deleteWorkout(id) {
    this.#workouts = this.#workouts.filter((w) => w.id !== id);
    //clear list
    this._clearList();
    //clear map
    this._clearMap();
    //render rest workouts
    this._renderWorkoutsOnMapOnList();
    //store in local
    this._storeWorkouts();
    //render action btns
    this._renderControlBtns();
    //close the form
    // this._hideForm();
  }

  _clearList() {
    document.querySelectorAll(".workout").forEach((w) => w.remove());
  }

  _clearMap() {
    this.#map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.#map.removeLayer(layer);
      }
    });
  }

  _moveToWorkout(id) {
    const workout = this.#workouts.find((workout) => workout.id === id);
    console.log(workout);
    // workout.click();

    this.#map.setView(workout.coords, this.#zoomLevel, {
      pan: { duration: 1 },
      animate: true,
    });

    this._hideForm();
    this._showStartBtn();
  }

  _storeWorkouts() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getStoredWorkouts() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    console.log(data);

    if (!data) return;

    this.#workouts = data;

    this._renderWorkoutsOnMapOnList();
  }

  _renderWorkoutsOnMapOnList() {
    this.#workouts.forEach((workout) => this._renderOnList(workout));

    this.#workouts.forEach((workout) => this._renderOnMap(workout));
  }

  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const app = new App();
