const prefix = "[leetcode-to-github]";

export function log(...args) {
  console.log(prefix, ...args);
}

export function warn(...args) {
  console.warn(prefix, ...args);
}

export function error(...args) {
  console.error(prefix, ...args);
}

