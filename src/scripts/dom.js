export const query = (selector, context = document) => context.querySelector(selector);
export const queryAll = (selector, context = document) => [...context.querySelectorAll(selector)];
