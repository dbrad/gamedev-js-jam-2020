export type EventCallback = (...args: any[]) => void;

const callbacks: EventCallback[] = [];

export function emit(eventName: string, ...args: any[]): void {
  callbacks[eventName] = callbacks[eventName] || [];
  callbacks[eventName].map(fn => fn(...args));
}

export function on(eventName: string, callback: EventCallback): void {
  callbacks[eventName] = callbacks[eventName] || [];
  callbacks[eventName].push(callback);
}

export function off(eventName: string, callback: EventCallback): void {
  if (!callbacks[eventName]) { return; }
  const index: number = callbacks[eventName].indexOf(callback);
  if (index < 0) { return; }
  callbacks[eventName].splice(index, 1);
}
