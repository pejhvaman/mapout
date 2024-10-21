"use strict";

const Person = function (firstName, birthYear) {
  this.firstName = firstName;
  this.birthYear = birthYear;
};

const pezhwa = new Person("Pezhwa", 1997);

console.log(pezhwa);

Person.prototype.calcAge = function () {
  return 2024 - this.birthYear;
};

console.log(pezhwa);

console.log(pezhwa.calcAge());

console.log(pezhwa instanceof Person);
console.log(Person.prototype);
console.log(Person.__proto__);
console.log(pezhwa.__proto__);
console.log(Person.prototype === pezhwa.__proto__);
console.log(Person.prototype.isPrototypeOf(pezhwa));
