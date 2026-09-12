// Input.js - Handles Keyboard, Pointer Lock Mouse Look, and Mobile Touch Controls

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.isPointerLocked = false;
    this.attackPressed = false;
    this.interactPressed = false;
    this.changeWeaponIndex = null;
    this.runPressed = false;

    // Mobile Virtual controls
    this.isMobile = false;
    this.touchMoveX = 0;
    this.touchMoveY = 0;
    this.touchLookDeltaX = 0;

    this._initListeners();
  }

  _initListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyE') this.interactPressed = true;
      if (e.code === 'Digit1') this.changeWeaponIndex = 0;
      if (e.code === 'Digit2') this.changeWeaponIndex = 1;
      if (e.code === 'Digit3') this.changeWeaponIndex = 2;
      if (e.code === 'Digit4') this.changeWeaponIndex = 3;
      if (e.code === 'Digit5') this.changeWeaponIndex = 4;
      if (e.code === 'KeyG' || e.code === 'KeyI') this.godModeToggle = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.runPressed = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.runPressed = false;
    });

    // Pointer lock for immersive retro mouse look
    this.canvas.addEventListener('click', () => {
      if (!this.isPointerLocked && document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock?.();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.canvas;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseDeltaX += e.movementX;
        this.mouseDeltaY += e.movementY;
      }
    });

    // Mouse buttons
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.attackPressed = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.attackPressed = false;
      }
    });

    window.addEventListener('wheel', (e) => {
      if (e.deltaY < 0) {
        this.weaponCycle = 1;
      } else if (e.deltaY > 0) {
        this.weaponCycle = -1;
      }
    });
  }

  update() {
    // Consume per-frame edge triggers if needed
  }

  resetDeltas() {
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.touchLookDeltaX = 0;
    this.interactPressed = false;
    this.changeWeaponIndex = null;
    this.weaponCycle = 0;
    this.godModeToggle = false;
  }

  isForward() {
    return !!(this.keys['KeyW'] || this.keys['ArrowUp'] || this.touchMoveY < -0.3);
  }

  isBackward() {
    return !!(this.keys['KeyS'] || this.keys['ArrowDown'] || this.touchMoveY > 0.3);
  }

  isStrafeLeft() {
    return !!(this.keys['KeyA'] || this.touchMoveX < -0.3);
  }

  isStrafeRight() {
    return !!(this.keys['KeyD'] || this.touchMoveX > 0.3);
  }

  isTurnLeft() {
    return !!this.keys['ArrowLeft'];
  }

  isTurnRight() {
    return !!this.keys['ArrowRight'];
  }
}
