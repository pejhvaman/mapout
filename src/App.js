"use strict";

import "./app.css";

import Running from "./Running";
import Cycling from "./Cycling";

import { COMMON_FILTER_CRITERIAS, WORKOUT_TYPES } from "./constants";

import { isAllValid, isAllPositive } from "./helpers";
import { toast } from "./ToastManager";

const workoutsContainer = document.querySelector(".list");
const workoutsList = document.querySelector(".workouts");
const workoutsForm = document.querySelector(".form");
// const workoutsEl = document.querySelec torAll(".workout");
const workoutTypeInput = document.querySelector(".form__input--type");
// const formRows = document.querySelectorAll(".form__row");
const distanceInput = document.querySelector(".form__input--distance");
const durationInput = document.querySelector(".form__input--duration");
const cadenceInput = document.querySelector(".form__input--cadence");
const elevationInput = document.querySelector(".form__input--elevation");
const closeBtn = document.querySelector(".close");
const showWorkoutsBtns = document.querySelector(".show-workouts");
const startBtn = document.querySelector(".show-workouts__on-list");
const showWorkoutsOnMapBtn = document.querySelector(".show-workouts__on-map");
const useCurrentLocationBtn = document.querySelector(".use-location-btn");
const overlay = document.querySelector(".overlay");
const confirmationModal = document.querySelector(".confirmation-modal");

class App {
  #map;
  #mapEvent;
  #zoomLevel = 15;
  #workouts = [];
  #currentWorkout = WORKOUT_TYPES[0]; //initial type

  constructor() {
    // get current position-> load map and attach handler to it
    this._getCurrentLocation.call(this);

    // submit handler to form
    workoutsForm.addEventListener("submit", this._newWorkout.bind(this));
    // change handler toggle elev and cadence inputs
    workoutTypeInput.addEventListener(
      "change",
      this._toggleWorkoutType.bind(this)
    );

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

    // attaching event listener to use your location btn
    useCurrentLocationBtn.addEventListener(
      "click",
      this._useCurrentLocation.bind(this)
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

  _useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadCurrentMapLocation.bind(this),

        () =>
          toast.show(
            "We couldn't find your location! 🥵 Make sure your using a VPN, and then refresh the app!",
            "error"
          )
      );
    }
  }

  _loadCurrentMapLocation(position) {
    const { latitude, longitude } = position.coords;
    const currentCoords = [latitude, longitude];

    this.#map.setView(currentCoords, this.#zoomLevel);
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

    // TODO: hide use current location
  }

  _hideForm() {
    workoutsForm.classList.add("hidden");

    workoutsContainer.classList.add("list--hidden");

    showWorkoutsBtns.classList.remove("hidden");

    //TODO show use current button
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
    const selectedType = workoutTypeInput.value;
    // cadenceInput.closest(".form__row").classList.add("form__row--hidden");
    // elevationInput.closest(".form__row").classList.add("form__row--hidden");

    if (selectedType === "running") {
      cadenceInput.closest(".form__row").classList.remove("form__row--hidden");

      elevationInput.closest(".form__row").classList.add("form__row--hidden");
    }

    if (selectedType === "cycling") {
      elevationInput
        .closest(".form__row")
        .classList.remove("form__row--hidden");
      cadenceInput.closest(".form__row").classList.add("form__row--hidden");
    }

    this.#currentWorkout = selectedType;
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
      <div class="controls--sort">
        <span class="controls--sort__title">Sort<img class="controls--sort__icon" src="./assets/sort.png" /></span>
        <ul class="controls--sort__list hidden">
          ${WORKOUT_TYPES.map(
            (workout) =>
              `<li class="controls--sort__item ${workout}">${workout}</li>`
          ).join("")}
        </ul>
      </div>
      <div class="controls--filter">
        <span class="controls--filter__title">Filter<img class="controls--filter__icon" src="./assets/menu.png" /></span>
        <ul class="controls--filter__list hidden">
          ${COMMON_FILTER_CRITERIAS.map(
            (filter) =>
              `<li class="controls--filter__item ${filter}">${filter}</li>`
          ).join("")}
        </ul>
      </div>
      </li>
      `;

      workoutsForm.insertAdjacentHTML("afterend", controlBtns);

      const deleteAllBtn = document.querySelector(".controls--deleteAll");
      const sortBtn = document.querySelector(".controls--sort__title");
      // const filterBtn = document.querySelector(".controls--filter__title");

      deleteAllBtn?.addEventListener(
        "click",
        this._resetWithConfirmation.bind(this)
      );

      sortBtn?.addEventListener("click", this._toggleSortList);
    }
  }

  _toggleSortList(e) {
    const sortList = document.querySelector(".controls--sort__list");

    console.log(sortList);

    sortList?.classList.toggle("hidden");

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".controls--sort")) {
        sortList.classList.add("hidden");
      }
    });
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
      return this._deleteWorkoutWithConfirmation(workoutId);
    }

    if (editWorkoutBtn) {
      console.log("edit");
    }
  }

  _deleteWorkoutWithConfirmation(id) {
    this._showConfirmationModal(
      this._deleteWorkout.bind(this, id),
      this._hideConfirmationModal
    );
  }

  _deleteWorkout(id) {
    //removing from workouts array
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
    // Close the list after deleting
    this._hideForm();
    //show deletion message
    toast.show("Workout was deleted successfully", "success");
    //Hide the confirmation modal
    this._hideConfirmationModal();
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

  _resetWithConfirmation() {
    this._showConfirmationModal(
      this._doReset.bind(this),
      this._hideConfirmationModal
    );
  }

  _showConfirmationModal(confirmHandler, cancelHandler) {
    overlay.classList.remove("hidden");
    confirmationModal.classList.remove("hidden");

    const confirmNoBtn = document.querySelector(".confirm-no");
    const confirmYesBtn = document.querySelector(".confirm-yes");

    confirmYesBtn.addEventListener("click", confirmHandler);
    confirmNoBtn.addEventListener("click", cancelHandler);
  }

  _hideConfirmationModal() {
    overlay.classList.add("hidden");
    confirmationModal.classList.add("hidden");

    const confirmNoBtn = document.querySelector(".confirm-no");
    const confirmYesBtn = document.querySelector(".confirm-yes");

    const newConfirmYesBtn = confirmYesBtn.cloneNode(true);
    confirmYesBtn.parentNode.replaceChild(newConfirmYesBtn, confirmYesBtn);

    const newConfirmNoBtn = confirmNoBtn.cloneNode(true);
    confirmNoBtn.parentNode.replaceChild(newConfirmNoBtn, confirmNoBtn);
  }

  _doReset() {
    localStorage.removeItem("workouts");
    this.#workouts = [];
    this._clearList();
    this._clearMap();
    this._renderControlBtns();
    // close the list
    this._hideForm();
    // show reset/deleteAll message
    toast.show(
      "All workouts has been deleted and the app was reset successfully!",
      "success"
    );

    this._hideConfirmationModal();
  }
}

const app = new App();
