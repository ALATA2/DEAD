// GameLoop.js - Fixed-timestep physics update & 60fps render loop

export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;

    this.targetFps = 60;
    this.step = 1 / 60;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.running = false;
    this.rafId = null;

    this._frame = this._frame.bind(this);

    // Auto pause when tab is inactive (§15)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.paused = true;
      } else {
        this.paused = false;
        this.lastTime = performance.now();
      }
    });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this._frame);
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _frame(currentTime) {
    if (!this.running) return;

    let delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp delta to avoid spiral of death on tab switches
    if (delta > 0.2) delta = 0.2;

    if (!this.paused) {
      this.accumulator += delta;
      while (this.accumulator >= this.step) {
        this.updateFn(this.step);
        this.accumulator -= this.step;
      }
      this.renderFn(delta);
    }

    this.rafId = requestAnimationFrame(this._frame);
  }
}
