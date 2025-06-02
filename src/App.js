"use strict";

import "./app.css";

import Running from "./Running";
import Cycling from "./Cycling";

import { isAllValid, isAllPositive } from "./helpers";
import { toast } from "./ToastManager";

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
const showWorkoutsBtns = document.querySelector(".show-workouts");
const startBtn = document.querySelector(".show-workouts__on-list");
const showWorkoutsOnMapBtn = document.querySelector(".show-workouts__on-map");

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
    // closeBtn.addEventListener("click", this._showShowWorkoutsBtns);

    workoutsList.addEventListener(
      "click",
      this._handleWorkoutActions.bind(this)
    );

    startBtn.addEventListener("click", this._showWorkouts.bind(this));

    showWorkoutsOnMapBtn.addEventListener(
      "click",
      this._showWorkoutsOnMap.bind(this)
    );
  }

  _showWorkouts() {
    this._showForm();
    this._hideFormFields();
    showWorkoutsBtns.classList.add("hidden");
  }

  _showWorkoutsOnMap() {
    if (this.#workouts.length === 0) return;

    const group = new L.featureGroup(
      this.#workouts.map((work) => L.marker(work.coords))
    );

    this.#map.fitBounds(group.getBounds(), {
      padding: [50, 50], // optional: adds some space around markers
    });
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

        // Fallback function when geolocation doesn't work!
        () =>
          toast.show(
            "We couldn't find your location! 🥵 Make sure your using a VPN, and then refresh the app!",
            "error"
          )
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
    this.#map.on("click", this._hideShowWorkoutsBtns.bind(this));
    this.#map.on("move", this._hideForm);
    this.#map.on("move", this._showShowWorkoutsBtns);

    this._getStoredWorkouts();
  }

  _hideShowWorkoutsBtns() {
    showWorkoutsBtns.classList.add("hidden");
  }

  _showShowWorkoutsBtns() {
    showWorkoutsBtns.classList.remove("hidden");
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;

    workoutsContainer.classList.remove("list--hidden");
    workoutsForm.classList.remove("hidden");

    this._renderControlBtns();

    setTimeout(() => distanceInput.focus(), 500);

    this._hideShowWorkoutsBtns();
    this._removeAddWorkoutMsg();
  }

  _hideForm() {
    workoutsForm.classList.add("hidden");

    workoutsContainer.classList.add("list--hidden");

    showWorkoutsBtns.classList.remove("hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // getting data
    const type = workoutTypeInput.value;
    const distance = +distanceInput.value;
    const duration = +durationInput.value;

    const { lat, lng } = this.#mapEvent?.latlng;
    const coords = [lat, lng];

    // validate inputs
    let workout;
    if (type === "running") {
      const cadence = +cadenceInput.value;
      if (
        !isAllValid(distance, duration, cadence) ||
        !isAllPositive(distance, duration, cadence)
      )
        return toast.show("Enter valid and positive numbers!", "warning");

      workout = new Running(coords, distance, duration, cadence);
      this.#workouts.push(workout);
    }
    if (type === "cycling") {
      const elevation = +elevationInput.value;
      if (
        !isAllValid(distance, duration, elevation) ||
        !isAllPositive(distance, duration)
      )
        return toast.show(
          "Enter valid and positive numbers! Elevation gain can be negative!",
          "warning"
        );

      workout = new Cycling(coords, distance, duration, elevation);
      this.#workouts.push(workout);
    }

    // show creation workout message
    toast.show(
      `${
        type.at(0).toUpperCase() + type.slice(1)
      } workout was created successfully!`
    );

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
      document.querySelector(".controls")?.remove();
    } else if (
      this.#workouts.length > 0 &&
      !document.querySelector(".controls")
    ) {
      const controlBtns = `
      <li class="controls">
      <div class="controls--deleteAll">
        <span class="controls--deleteAll__title">Delete all</span>
      </div>
      </li>
      `;

      workoutsForm.insertAdjacentHTML("afterend", controlBtns);

      const deleteAllBtn = document.querySelector(".controls--deleteAll");

      //TODO: Do the confirmtion first!

      deleteAllBtn?.addEventListener("click", this._reset.bind(this));
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
      return this._deleteWorkout(workoutId);
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
    // TODO: confirmation message first!

    //show deletion message
    toast.show("Workout was deleted successfully", "success");
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
    workout.click();

    this.#map.setView(workout.coords, this.#zoomLevel, {
      pan: { duration: 1 },
      animate: true,
    });

    this._hideForm();
    this._showShowWorkoutsBtns();
  }

  _storeWorkouts() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getStoredWorkouts() {
    // Reading workouts from localStorage
    const data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) return;

    // Restore objects from localStorage after page reload to rebuild their prototype => this will fix the problem with the public API that is inheritted from a parent class (Workouts) to a child class (Running/Cycling)
    const restoredObjects = data.map((el) =>
      el.name === "running"
        ? new Running(el.coords, el.distance, el.duration, el.cadence)
        : new Cycling(el.coords, el.distance, el.duration, el.elevation)
    );

    // Set the app's workouts to stored workouts
    this.#workouts = restoredObjects;

    // Show the restored workouts on the map and on the list
    this._renderWorkoutsOnMapOnList();
  }

  _renderWorkoutsOnMapOnList() {
    this.#workouts.forEach((workout) => this._renderOnList(workout));

    this.#workouts.forEach((workout) => this._renderOnMap(workout));
  }

  _reset() {
    localStorage.removeItem("workouts");
    this.#workouts = [];
    this._clearList();
    this._clearMap();
    this._renderControlBtns();
    // location.reload();
    // show reset/deleteAll message
    toast.show(
      "All workouts has been deleted and the app was reset successfully!",
      "success"
    );
  }
}

const app = new App();
