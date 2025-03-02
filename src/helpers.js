export const isAllValid = (...inputs) =>
  inputs.every((input) => isFinite(input));
export const isAllPositive = (...inputs) => inputs.every((input) => input > 0);
