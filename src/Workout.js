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

export default class Workout {
  clicked = 0;
  date = new Date();
  id = crypto.randomUUID();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    this.description = `${this.name === "running" ? "🏃‍♀️" : "🚴‍♀️"} ${
      this.name[0].toUpperCase() + this.name.slice(1)
    } ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }

  click() {
    //PAPI
    this.clicked++;
  }
}
