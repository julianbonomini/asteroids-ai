class Pool {
  constructor(type, size) {
    this._type = type;
    this._size = size;
    this._pointer = size;
    this._elements = [];
    for (let i = 0; i < this._size; ++i) {
      this._elements[i] = new this._type();
    }
  }

  getElement = () => {
    if (this._pointer > 0) return this._elements[--this._pointer];
    return null;
  };

  disposeElement = obj => {
    this._elements[this._pointer++] = obj;
  };
}

class Vec2D {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  getX = () => {
    return this._x;
  }
  setX = value => {
    this._x = value;
  }
  getY = () => {
    return this._y;
  }
  setY = value => {
    this._y = value;
  }
  setXY = (x, y) => {
    this._x = x;
    this._y = y;
  }
  getXY = () => {
    return { _x: this._x, _y: this._y };
  }
  getLength = () => {
    return Math.sqrt(this._x * this._x + this._y * this._y);
  }
  setLength = length => {
    var angle = this.getAngle();
    this._x = Math.cos(angle) * length;
    this._y = Math.sin(angle) * length;
  }
  getAngle = () => {
    return Math.atan2(this._y, this._x);
  }
  setAngle = angle => {
    var length = this.getLength();
    this._x = Math.cos(angle) * length;
    this._y = Math.sin(angle) * length;
  }
  add = vector => {
    this._x += vector.getX();
    this._y += vector.getY();
  }
  sub = vector => {
    this._x -= vector.getX();
    this._y -= vector.getY();
  }
  mul = value => {
    this._x *= value;
    this._y *= value;
  }
  div = value => {
    this._x /= value;
    this._y /= value;
  }
}

class Particle {
  constructor() {
    this.radius = 1;
    this.color = '#FFF';
    this.lifeSpan = 0;
    this.fric = 0.98;
    this.pos = new Vec2D(0, 0);
    this.vel = new Vec2D(0, 0);
    this.blacklisted = false;
  }

  update = () => {
    this.pos.add(this.vel);
    this.vel.mul(this.fric);
    this.radius -= 0.1;
    if (this.radius < 0.1) this.radius = 0.1;
    if (this.lifeSpan-- < 0) {
      this.blacklisted = true;
    }
  };
  reset = () => {
    this.blacklisted = false;
  };
}

class Bullet {
  constructor() {
    this.radius = 4;
    this.color = '#FFF';
    this.pos = new Vec2D(0, 0);
    this.vel = new Vec2D(0, 0);
    this.blacklisted = false;
  }

  update = () => {
    this.pos.add(this.vel);
  };

  reset = () => {
    this.blacklisted = false;
  };
}

class Asteroid {
  constructor() {
    this.radius = Math.floor(Math.random() * 101) + 450;
    this.color = '#FF5900';
    this.pos = new Vec2D(0, 0);
    this.vel = new Vec2D(0, 0);
    this.blacklisted = false;
    this.type = 1;
    this.sides = (Math.random() * 2 + 7) >> 0;
    this.angle = 0;
    this.angleVel = (1 - Math.random() * 2) * 0.01;
  }

  update = () => {
    this.pos.add(this.vel);
    this.angle += this.angleVel;
  };

  reset = () => {
    this.blacklisted = false;
  };

  setColor = color => {
    this.color = color;
  }
}

class Ship {
  constructor(x, y, brain, ref) {
    this.angle = 0;
    this.pos = new Vec2D(x, y);
    this.vel = new Vec2D(0, 0);
    this.thrust = new Vec2D(0, 0);
    this.ref = ref;
    this.bulletDelay = null;
    this.idle = false;
    this.radius = 8;
    this.idleDelay = 0;
    this.brain = brain;
  }

  setBrain = brain => {
    this.brain = brain;
  }

  update = () => {
    this.vel.add(this.thrust);
    this.pos.add(this.vel);
    if (this.vel.getLength() > 5) this.vel.setLength(5);
    ++this.bulletDelay;
    if (this.idle) {
      if (++this.idleDelay > 120) {
        this.idleDelay = 0;
        this.idle = false;

        this.ref.resetGame();
      }
    }
  }

  shoot = () => {
    if (this.bulletDelay > 8) {
      this.ref.generateShot();
      this.bulletDelay = 0;
    }
  }
}

class Game {
  constructor(onGameOver) {
    this.canvas;
    this.context;
    this.screenWidth;
    this.screenHeight;
    this.doublePI = Math.PI * 2;
    //game vars
    this.isGameFinished = false;

    //game vars
    this.ship;
    this.particlePool;
    this.particles;
    this.bulletPool;
    this.bullets;
    this.asteroidPool;
    this.asteroids;
    this.hScan;
    this.asteroidVelFactor = 0;
    this.score = 0;
    this.gameOver = onGameOver;
    //keyboard vars
    this.keyLeft = false;
    this.keyUp = false;
    this.keyRight = false;
    this.keyDown = false;
    this.keySpace = false;
    this.getAnimationFrame = function (callback) {
      window.setTimeout(callback, 16.6);
    };
    this.pool = new Pool();
  }

  startGame(brain, canvasNumber) {
    const canvasId = `canvas-${canvasNumber}`;
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');
    this.context.font = '48px serif';

    if (!this.canvas) return;

    this.screenWidth = this.canvas.clientWidth;
    this.screenHeight = this.canvas.clientHeight;

    this.canvas.width = this.screenWidth;
    this.canvas.height = this.screenHeight;

    this.hScan = (this.screenHeight / 4) >> 0;
    this.isGameFinished = false;
    // this.keyboardInit();
    this.particleInit();
    this.bulletInit();
    this.asteroidInit();
    this.shipInit(brain);

    this.loop(this);
  }

  finishGame() {
    this.isGameFinished = true;
    this.ship = null;
    this.particlePool = [];
    this.particles = [];
    this.bulletPool = [];
    this.bullets = [];
    this.asteroidPool = [];
    this.asteroids = [];
    this.hScan = null;
    this.asteroidVelFactor = 0;
    this.score = 0;
  }

  particleInit() {
    this.particlePool = new Pool(Particle, 100);
    this.particles = [];
  }

  bulletInit() {
    this.bulletPool = new Pool(Bullet, 40);
    this.bullets = [];
  }

  asteroidInit() {
    this.asteroidPool = new Pool(Asteroid, 50);
    this.asteroids = [];
  }

  shipInit(brain) {
    brain.score = this.score;
    this.ship = new Ship(this.screenWidth >> 1, this.screenHeight >> 1, brain, this);
  }

  loop() {
    if (this.ship) {
      this.takeAction();
      this.updateShip();
      this.updateParticles();
      this.updateBullets();
      this.updateAsteroids();

      this.checkCollisions();

      if (FOR_HUMAN_EYE) {
        this.render();
      }


      if (FOR_HUMAN_EYE) {
        if (window.requestAnimationFrame) {
          this.animationId = window.requestAnimationFrame(() => this.loop(this));
        }
      } else {
        setInterval(() => {
          this.loop();
        }, 100)
      }

    }
  }

  takeAction() {
    const asteroids = this.getClosestAsteroids(this.ship);
    if (this.asteroids.length < MINIMUN_ASTEROIDS_COUNT) {
      return; //Do nothing while the asteroids are not initialized
    }
    // Activate the neural network (aka "where the magic happens")
    const input = [];
    asteroids.forEach(asteroid => {
      input.push(asteroid.pos.getX());
      input.push(asteroid.pos.getY());
      input.push(asteroid.vel.getY());
      input.push(asteroid.vel.getY());
      input.push(asteroid.type);
    });
    const output = this.ship.brain.activate(input).map(o => Math.round(o));

    this.keyLeft = output[0]  //Go Left  (press A key)
    this.keyUp = output[1]    //Go Up    (press W key)
    this.keyRight = output[2] //Go Right (press D key)
    this.keySpace = output[3] //Shoow    (press Space/K key)
    if (this.keyUp) {
      this.score += 0.1;
    }
  }

  getClosestAsteroids(ship) {
    const shipPos = ship.pos.getXY();
    if (this.asteroids.length < MINIMUN_ASTEROIDS_COUNT) {
      return []
    }
    let closestAsteroids = [];
    let distance = 1000000;

    const compareFunction = (a, b) => {
      const xFromShipA = shipPos._x - a.pos.getX();
      const yFromShipA = shipPos._y - a.pos.getY();
      const currentAsteroidDistanceA = Math.sqrt(Math.pow(xFromShipA, 2) + Math.pow(yFromShipA, 2));
      const xFromShipB = shipPos._x - b.pos.getX();
      const yFromShipB = shipPos._y - b.pos.getY();
      const currentAsteroidDistanceB = Math.sqrt(Math.pow(xFromShipB, 2) + Math.pow(yFromShipB, 2));
      if (currentAsteroidDistanceA < currentAsteroidDistanceB) {
        return -1;
      }
      if (currentAsteroidDistanceA > currentAsteroidDistanceB) {
        return 1;
      }
      return 0;
    }
    this.asteroids.sort(compareFunction);
    const superCloseAmount = Math.floor(MINIMUN_ASTEROIDS_COUNT / 2);
    for (let i = 0; i < superCloseAmount; i++) {
      this.asteroids[i].setColor('#8a2be2');
      closestAsteroids.push(this.asteroids[i]);
    }
    for (let i = superCloseAmount; i < this.asteroids.length; i++) {
      this.asteroids[i].setColor('#FF5900');
    }
    return closestAsteroids;
  }

  updateShip() {
    this.ship.update();

    if (this.ship.idle) return;

    if (this.keySpace) this.ship.shoot();
    if (this.keyLeft) this.ship.angle -= 0.1;
    if (this.keyRight) this.ship.angle += 0.1;

    if (this.keyUp) {
      this.ship.thrust.setLength(0.1);
      this.ship.thrust.setAngle(this.ship.angle);

      // this.generateThrustParticle();
    }
    else {
      this.ship.vel.mul(0.94);
      this.ship.thrust.setLength(0);
    }

    if (this.ship.pos.getX() > this.screenWidth) this.ship.pos.setX(0);
    else if (this.ship.pos.getX() < 0) this.ship.pos.setX(this.screenWidth);

    if (this.ship.pos.getY() > this.screenHeight) this.ship.pos.setY(0);
    else if (this.ship.pos.getY() < 0) this.ship.pos.setY(this.screenHeight);
  }

  // generateThrustParticle() {
  //   var p = this.particlePool.getElement();

  //   //if the particle pool doesn't have more elements, will return 'null'.

  //   if (!p) return;

  //   p.radius = Math.random() * 3 + 2;
  //   p.color = '#FFF';
  //   p.lifeSpan = 80;
  //   p.pos.setXY(this.ship.pos.getX() + Math.cos(this.ship.angle) * -14, this.ship.pos.getY() + Math.sin(this.ship.angle) * -14);
  //   p.vel.setLength(8 / p.radius);
  //   p.vel.setAngle(this.ship.angle + (1 - Math.random() * 2) * (Math.PI / 18));
  //   p.vel.mul(-1);

  //   //particles[particles.length] = p; same as: particles.push(p);

  //   this.particles[this.particles.length] = p;
  // }

  updateParticles() {
    var i = this.particles.length - 1;

    for (i; i > -1; --i) {
      var p = this.particles[i];

      if (p.blacklisted) {
        p.reset();

        this.particles.splice(this.particles.indexOf(p), 1);
        this.particlePool.disposeElement(p);

        continue;
      }

      p.update();
    }
  }

  updateBullets() {
    var i = this.bullets.length - 1;

    for (i; i > -1; --i) {
      var b = this.bullets[i];

      if (b.blacklisted) {
        b.reset();

        this.bullets.splice(this.bullets.indexOf(b), 1);
        this.bulletPool.disposeElement(b);

        continue;
      }

      b.update();

      if (b.pos.getX() > this.screenWidth) b.blacklisted = true;
      else if (b.pos.getX() < 0) b.blacklisted = true;

      if (b.pos.getY() > this.screenHeight) b.blacklisted = true;
      else if (b.pos.getY() < 0) b.blacklisted = true;
    }
  }

  updateAsteroids() {
    var i = this.asteroids.length - 1;

    for (i; i > -1; --i) {
      var a = this.asteroids[i];

      if (a.blacklisted) {
        a.reset();

        this.asteroids.splice(this.asteroids.indexOf(a), 1);
        this.asteroidPool.disposeElement(a);

        continue;
      }

      a.update();

      if (a.pos.getX() > this.screenWidth + a.radius) a.pos.setX(-a.radius);
      else if (a.pos.getX() < -a.radius) a.pos.setX(this.screenWidth + a.radius);

      if (a.pos.getY() > this.screenHeight + a.radius) a.pos.setY(-a.radius);
      else if (a.pos.getY() < -a.radius) a.pos.setY(this.screenHeight + a.radius);
    }

    if (this.asteroids.length < MINIMUN_ASTEROIDS_COUNT) {
      var factor = (Math.random() * 2) >> 0;

      this.generateAsteroid(this.screenWidth * factor, this.screenHeight * factor, 20, 1);
    }
  }

  generateAsteroid(x, y, radius, type) {
    var a = this.asteroidPool.getElement();

    //if the bullet pool doesn't have more elements, will return 'null'.

    if (!a) return;

    a.radius = radius;
    a.type = type;
    a.pos.setXY(x, y);
    a.vel.setLength(1 + this.asteroidVelFactor);
    a.vel.setAngle(Math.random() * (Math.PI * 2));

    //bullets[bullets.length] = b; same as: bullets.push(b);

    this.asteroids[this.asteroids.length] = a;
    this.asteroidVelFactor += 0.025;
  }

  checkCollisions() {
    this.checkBulletAsteroidCollisions();
    this.checkShipAsteroidCollisions();
  }

  checkBulletAsteroidCollisions() {
    var i = this.bullets.length - 1;
    var j;

    for (i; i > -1; --i) {
      j = this.asteroids.length - 1;

      for (j; j > -1; --j) {
        var b = this.bullets[i];
        var a = this.asteroids[j];

        if (this.checkDistanceCollision(b, a)) {
          b.blacklisted = true;
          if (a.type == 1) {
            this.score += BIG_ASTEROID;
          } else if (a.type == 2) {
            this.score += MEDIUM_ASTEROID;
          } else if (a.type == 3) {
            this.score += SMALL_ASTEROID;
          }
          this.destroyAsteroid(a);
        }
      }
    }
  }

  checkShipAsteroidCollisions() {
    var i = this.asteroids.length - 1;

    for (i; i > -1; --i) {
      var a = this.asteroids[i];
      var s = this.ship;

      if (this.checkDistanceCollision(a, s)) {
        if (s.idle) return;

        s.idle = true;

        // this.generateShipExplosion();
        // this.destroyAsteroid(a);
        this.ship.brain.score = this.score;
        this.finishGame();
        this.gameOver(this.score);
        break;
      }
    }
  }

  generateShipExplosion() {
    var i = 18;

    for (i; i > -1; --i) {
      var p = this.particlePool.getElement();

      //if the particle pool doesn't have more elements, will return 'null'.

      if (!p) return;

      p.radius = Math.random() * 6 + 2;
      p.lifeSpan = 80;
      p.color = '#FFF';
      p.vel.setLength(20 / p.radius);
      p.vel.setAngle(this.ship.angle + (1 - Math.random() * 2) * this.doublePI);
      p.pos.setXY(this.ship.pos.getX() + Math.cos(p.vel.getAngle()) * (this.ship.radius * 0.8), this.ship.pos.getY() + Math.sin(p.vel.getAngle()) * (this.ship.radius * 0.8));

      //particles[particles.length] = p; same as: particles.push(p);

      this.particles[this.particles.length] = p;
    }
  }

  checkDistanceCollision(obj1, obj2) {
    var vx = obj1.pos.getX() - obj2.pos.getX();
    var vy = obj1.pos.getY() - obj2.pos.getY();
    var vec = new Vec2D(vx, vy);

    if (vec.getLength() < obj1.radius + obj2.radius) {
      return true;
    }

    return false;
  }

  destroyAsteroid(asteroid) {
    asteroid.blacklisted = true;

    this.generateAsteroidExplosion(asteroid);
    this.resolveAsteroidType(asteroid);
  }

  generateAsteroidExplosion(asteroid) {
    var i = 18;

    for (i; i > -1; --i) {
      var p = this.particlePool.getElement();

      //if the particle pool doesn't have more elements, will return 'null'.

      if (!p) return;

      p.radius = Math.random() * (asteroid.radius >> 2) + 2;
      p.lifeSpan = 80;
      p.color = '#FF5900';
      p.vel.setLength(20 / p.radius);
      p.vel.setAngle(this.ship.angle + (1 - Math.random() * 2) * this.doublePI);
      p.pos.setXY(asteroid.pos.getX() + Math.cos(p.vel.getAngle()) * (asteroid.radius * 0.8), asteroid.pos.getY() + Math.sin(p.vel.getAngle()) * (asteroid.radius * 0.8));

      //particles[particles.length] = p; same as: particles.push(p);

      this.particles[this.particles.length] = p;
    }
  }

  resolveAsteroidType(asteroid) {
    switch (asteroid.type) {
      case 1:
        this.generateAsteroid(asteroid.pos.getX(), asteroid.pos.getY(), 10, 2);
        this.generateAsteroid(asteroid.pos.getX(), asteroid.pos.getY(), 10, 2);
        break;
      case 2:
        this.generateAsteroid(asteroid.pos.getX(), asteroid.pos.getY(), 5, 3);
        this.generateAsteroid(asteroid.pos.getX(), asteroid.pos.getY(), 5, 3);
        break;
    }
  }

  render() {
    this.context.fillStyle = '#262626';
    this.context.globalAlpha = 0.9;
    this.context.fillRect(0, 0, this.screenWidth, this.screenHeight);
    this.context.globalAlpha = 1;

    this.renderShip();
    this.renderParticles();
    this.renderBullets();
    this.renderAsteroids();
    this.renderScanlines();
  }

  renderShip() {
    if (this.ship.idle) return;

    this.context.save();
    this.context.translate(this.ship.pos.getX() >> 0, this.ship.pos.getY() >> 0);
    this.context.rotate(this.ship.angle);

    this.context.strokeStyle = '#FFF';
    this.context.lineWidth = (Math.random() > 0.9) ? 2 : 1;
    this.context.beginPath();
    this.context.moveTo(5, 0);
    this.context.lineTo(-5, -5);
    this.context.lineTo(-5, 5);
    this.context.lineTo(5, 0);
    this.context.stroke();
    this.context.closePath();

    this.context.restore();
  }

  renderParticles() {
    //inverse for loop = more performance.

    var i = this.particles.length - 1;

    for (i; i > -1; --i) {
      var p = this.particles[i];

      this.context.beginPath();
      this.context.strokeStyle = p.color;
      this.context.arc(p.pos.getX() >> 0, p.pos.getY() >> 0, 1, 0, this.doublePI);
      if (Math.random() > 0.4) this.context.stroke();
      this.context.closePath();
    }
  }

  renderBullets() {
    //inverse for loop = more performance.

    var i = this.bullets.length - 1;

    for (i; i > -1; --i) {
      var b = this.bullets[i];

      this.context.beginPath();
      this.context.strokeStyle = b.color;
      this.context.arc(b.pos.getX() >> 0, b.pos.getY() >> 0, b.radius, 0, this.doublePI);
      if (Math.random() > 0.2) this.context.stroke();
      this.context.closePath();
    }
  }

  renderAsteroids() {
    //inverse for loop = more performance.

    var i = this.asteroids.length - 1;

    for (i; i > -1; --i) {
      var a = this.asteroids[i];

      this.context.beginPath();
      this.context.lineWidth = (Math.random() > 0.2) ? 4 : 3;
      this.context.strokeStyle = a.color;

      var j = a.sides;

      this.context.moveTo((a.pos.getX() + Math.cos(this.doublePI * (j / a.sides) + a.angle) * a.radius) >> 0, (a.pos.getY() + Math.sin(this.doublePI * (j / a.sides) + a.angle) * a.radius) >> 0);

      for (j; j > -1; --j) {
        this.context.lineTo((a.pos.getX() + Math.cos(this.doublePI * (j / a.sides) + a.angle) * a.radius) >> 0, (a.pos.getY() + Math.sin(this.doublePI * (j / a.sides) + a.angle) * a.radius) >> 0);
      }

      this.context.stroke();

      this.context.closePath();
    }
  }

  renderScanlines() {
    //inverse for loop = more performance.

    var i = this.hScan;

    this.context.globalAlpha = 0.05;
    this.context.lineWidth = 1;

    for (i; i > -1; --i) {
      this.context.beginPath();
      this.context.moveTo(0, i * 4);
      this.context.lineTo(this.screenWidth, i * 4);
      this.context.strokeStyle = (Math.random() > 0.0001) ? '#FFF' : '#222';
      this.context.stroke();
    }

    this.context.globalAlpha = 1;
  }

  generateShot() {
    var b = this.bulletPool.getElement();
    //if the bullet pool doesn't have more elements, will return 'null'.
    if (!b) return;

    b.radius = 1;
    b.pos.setXY(this.ship.pos.getX() + Math.cos(this.ship.angle) * 14, this.ship.pos.getY() + Math.sin(this.ship.angle) * 14);
    b.vel.setLength(10);
    b.vel.setAngle(this.ship.angle);

    //bullets[bullets.length] = b; same as: bullets.push(b);

    this.bullets[this.bullets.length] = b;
    this.score -= 1; //Prevent from shooting all the time
  }

  resetGame() {
    this.asteroidVelFactor = 0;

    this.ship.pos.setXY(this.screenWidth >> 1, this.screenHeight >> 1);
    this.ship.vel.setXY(0, 0);

    this.resetAsteroids();
  }

  resetAsteroids() {
    var i = this.asteroids.length - 1;

    for (i; i > -1; --i) {
      var a = this.asteroids[i];
      a.blacklisted = true;
    }
  }
}