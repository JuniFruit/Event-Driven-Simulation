"use strict";

class ParticleOptimized {
  mass = 0.5;
  radius = 10;
  bounce = -1;
  collisions = 0;
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;

  constructor(x, y, speed, angle, fillStyle) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.fillStyle = fillStyle;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  collisionCount() {
    return this.collisions;
  }

  bounceOff(particle) {
    const dx = particle.x - this.x;
    const dy = particle.y - this.y;
    const relVelx = particle.vx - this.vx;
    const relVely = particle.vy - this.vy;
    const speed = dx * relVelx + dy * relVely;
    const distance = particle.radius + this.radius;
    const J =
      (2 * this.mass * particle.mass * speed) /
      ((particle.mass + this.mass) * distance);
    const Jx = (J * dx) / distance;
    const Jy = (J * dy) / distance;
    this.vx += Jx / this.mass;
    this.vy += Jy / this.mass;
    particle.vx -= Jx / particle.mass;
    particle.vy -= Jy / particle.mass;
    this.collisions++;
    particle.collisions++;
  }

  predictWallHitX(screenW) {
    if (this.vx > 0) return (screenW - this.x - this.radius) / this.vx;
    else if (this.vx < 0) return (this.radius - this.x) / this.vx;
    else return Infinity;
  }

  predictWallHitY(screenH) {
    if (this.vy > 0) return (screenH - this.y - this.radius) / this.vy;
    else if (this.vy < 0) return (0 + this.radius - this.y) / this.vy;
    else return Infinity;
  }
  predictTimeToCollide(particle) {
    if (this == particle) return Infinity;
    let dx = particle.x - this.x;
    let dy = particle.y - this.y;
    let dvx = particle.vx - this.vx;
    let dvy = particle.vy - this.vy;
    let dvdr = dx * dvx + dy * dvy;
    if (dvdr > 0) return Infinity;
    let dvdv = dvx * dvx + dvy * dvy;
    let drdr = dx * dx + dy * dy;
    let sigma = this.radius + particle.radius;
    let d = dvdr * dvdr - dvdv * (drdr - sigma * sigma);
    if (d < 0) return Infinity;
    return -(dvdr + Math.sqrt(d)) / dvdv;
  }

  bounceOfWallX() {
    this.vx *= this.bounce;
    this.collisions++;
  }

  bounceOfWallY() {
    this.vy *= this.bounce;
    this.collisions++;
  }
}
