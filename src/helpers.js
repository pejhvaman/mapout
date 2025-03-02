export const isValid = (...inputs) => inputs.every((input) => isFinite(input));
export const _isAllPositive = (...inputs) => inputs.every((input) => input > 0);
