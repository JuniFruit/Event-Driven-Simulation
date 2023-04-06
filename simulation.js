"use strict";
class SimEvent {
  countA = 0;
  countB = 0;
  constructor(time, particleA, particleB) {
    this.time = time;
    this.particleA = particleA;
    this.particleB = particleB;
    this.countA = particleA ? particleA.collisionCount() : -1;
    this.countB = particleB ? particleB.collisionCount() : -1;
  }
  compareTo(eventB) {
    if (!eventB) return;
    return this.time - eventB.time;
  }
  isValid() {
    if (
      this.particleA != null &&
      this.particleA.collisionCount() != this.countA
    )
      return false;
    if (
      this.particleB != null &&
      this.particleB.collisionCount() != this.countB
    )
      return false;
    return true;
  }
}

class Simulation {
  particles = [];
  limit = 1000000;
  hz = 1000;
  minPQ = new MinHeap();
  time = 0;
  isRunning = false;

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
  }

  #populateParticles(num, isRandomMass = false) {
    for (let i = 0; i < num; i++) {
      const particle = new ParticleOptimized(
        randomRange(0, this.canvas.width),
        randomRange(0, this.canvas.height),
        randomRange(500, 1000),
        randomRange(0, Math.PI * 2),
        //prettier-ignore
        `rgb(${Math.trunc(randomRange(0, 255))},${Math.trunc(randomRange(0, 255))},${Math.trunc(randomRange(0,255))})`
      );
      if (isRandomMass) {
        particle.mass = randomRange(1, 5);
        particle.radius = particle.radius * particle.mass;
      }
      this.particles.push(particle);
    }
  }

  predict(particleA) {
    if (!particleA) return;
    for (let particle of this.particles) {
      // predict with other particles
      const dtParticle = particleA.predictTimeToCollide(particle);
      this.minPQ.add(new SimEvent(this.time + dtParticle, particleA, particle));
    }
    const dtX = particleA.predictWallHitX(this.canvas.width);
    const dtY = particleA.predictWallHitY(this.canvas.height);

    if (this.time + dtX <= this.limit) {
      this.minPQ.add(new SimEvent(this.time + dtX, particleA, null));
    }
    if (this.time + dtY <= this.limit) {
      this.minPQ.add(new SimEvent(this.time + dtY, null, particleA));
    }
  }

  predictEvents() {
    for (let particle of this.particles) {
      this.predict(particle);
    }
    this.minPQ.add(new SimEvent(0, null, null));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let particle of this.particles) {
      this.ctx.beginPath();
      this.ctx.fillStyle = particle.fillStyle;
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.closePath();
      //   this.#debug(particle);
    }

    if (this.time < this.limit) {
      this.minPQ.add(new SimEvent(this.time + 1.0 / this.hz, null, null));
    }
  }
  simulate(num, isRandomMass) {
    if (!this.particles.length) this.#populateParticles(num, isRandomMass);
    if (this.minPQ.isEmpty()) this.predictEvents();
    this.isRunning = true;
    setTimeout(() => {
      this.#loop();
    }, 0);
  }

  stopSimulation() {
    this.isRunning = false;
  }

  #loop() {
    if (!this.isRunning) return;
    if (this.minPQ.isEmpty()) return;

    const closest = this.minPQ.pop();
    if (closest.isValid()) {
      const particleA = closest.particleA;
      const particleB = closest.particleB;
      for (let particle of this.particles) {
        particle.update(closest.time - this.time);
      }
      this.time = closest.time;
      this.#processHit(particleA, particleB);

      this.predict(particleA);
      this.predict(particleB);
    }

    setTimeout(() => {
      this.#loop();
    }, 0);
  }

  #debug(particle) {
    this.ctx.beginPath();
    this.ctx.font = "12px serif";
    this.ctx.fillText(
      `My pos: ${particle.x.toFixed(2)}, ${particle.y.toFixed(2)}`,
      particle.x,
      particle.y
    );
  }

  #processHit(particleA, particleB) {
    if (particleA !== null && particleB !== null) {
      particleA.bounceOff(particleB);
    } else if (particleA !== null && particleB === null) {
      particleA.bounceOfWallX();
    } else if (particleA === null && particleB !== null) {
      particleB.bounceOfWallY();
    } else if (particleA === null && particleB === null) {
      this.draw();
    }
  }
}
function randomRange(min, max) {
  return min + Math.random() * (max - min);
}
function circleCollision(c0, c1) {
  return distance(c0, c1) <= c0.radius + c1.radius;
}
function distance(obj0, obj1) {
  const dx = obj0.x - obj1.x;
  const dy = obj0.y - obj1.y;
  return Math.sqrt(dx ** 2 + dy ** 2);
}
