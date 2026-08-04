export class CameraEffects {
  private camera: Phaser.Cameras.Scene2D.Camera;

  constructor(camera: Phaser.Cameras.Scene2D.Camera) {
    this.camera = camera;
  }

  smallShake() {
    this.camera.shake(100, 0.005);
  }

  heavyShake() {
    this.camera.shake(200, 0.015);
  }

  zoomPulse() {
    this.camera.zoomTo(1.05, 100, 'Sine.easeInOut', true, (cam, progress) => {
      if (progress === 1) {
        this.camera.zoomTo(1, 100, 'Sine.easeInOut');
      }
    });
  }

  smoothFollow(targetY: number) {
    // We can manually ease the camera scroll Y
    this.camera.scene.tweens.add({
      targets: this.camera,
      scrollY: targetY,
      duration: 500,
      ease: 'Power2'
    });
  }
}
