// Задачи и обработчики принадлежат одному экземпляру сменяемого DOM.
export function createPageLifetime() {
  let disposed = false;
  const frames = new Set();
  const timers = new Set();
  const listeners = new Set();
  return {
    get disposed() { return disposed; },
    frame(callback) {
      if (disposed) return;
      const id = requestAnimationFrame((time) => {
        frames.delete(id);
        if (!disposed) callback(time);
      });
      frames.add(id);
      return id;
    },
    timeout(callback, delay) {
      if (disposed) return;
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (!disposed) callback();
      }, delay);
      timers.add(id);
      return id;
    },
    clearTimeout(id) {
      window.clearTimeout(id);
      timers.delete(id);
    },
    /** @param {AddEventListenerOptions | boolean} [options] */
    listen(target, type, callback, options = undefined) {
      if (disposed || !target) return () => {};
      const handler = (event) => { if (!disposed) callback(event); };
      target.addEventListener(type, handler, options);
      const remove = () => {
        target.removeEventListener(type, handler, options);
        listeners.delete(remove);
      };
      listeners.add(remove);
      return remove;
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      frames.forEach(id => cancelAnimationFrame(id));
      timers.forEach(id => window.clearTimeout(id));
      listeners.forEach(remove => remove());
      frames.clear();
      timers.clear();
    },
  };
}
