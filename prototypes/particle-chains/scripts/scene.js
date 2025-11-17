import { createDefaultConfig } from "./config.js";

export function createScene(stageEl) {
  const app = new PIXI.Application({
    backgroundAlpha: 0,
    antialias: true,
  });

  stageEl.appendChild(app.view);

  const particleLayer = new PIXI.Container();
  app.stage.addChild(particleLayer);

  const particleTexture = makeCircleTexture(app, 0xffffff);
  const particles = [];
  const emitters = [];
  let currentConfig = null;

  function colorToNumber(hex) {
    return parseInt(hex.replace("#", "0x"), 16);
  }

  function makeCircleTexture(application, color) {
    const gfx = new PIXI.Graphics();
    const radius = 14;
    const gradient = PIXI.FillGradient.linear(0, -radius, 0, radius);
    gradient.addColorStop(0, color, 1);
    gradient.addColorStop(1, color, 0.35);

    gfx.fill(gradient);
    gfx.circle(radius, radius, radius);
    gfx.fill();

    return application.renderer.generateTexture(gfx);
  }

  function clearScene() {
    for (let i = particles.length - 1; i >= 0; i--) {
      particleLayer.removeChild(particles[i].sprite);
      particles[i].sprite.destroy();
    }
    particles.length = 0;
    emitters.length = 0;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function createParticle(emitter) {
    const angle = emitter.direction + rand(-emitter.spread * 0.5, emitter.spread * 0.5);
    const speed = rand(emitter.speed[0], emitter.speed[1]);
    const size = rand(0.6, 1.1);
    const sprite = new PIXI.Sprite(particleTexture);
    sprite.anchor.set(0.5);
    sprite.tint = colorToNumber(emitter.color);
    sprite.position.set(emitter.x, emitter.y);
    sprite.scale.set(size);
    sprite.alpha = 1;
    particleLayer.addChild(sprite);

    return {
      sprite,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: emitter.particleLife,
      age: 0,
      chain: emitter.chain,
    };
  }

  function createEmitter(config) {
    const emitter = {
      x: config.x,
      y: config.y,
      direction: config.direction ?? -Math.PI / 2,
      spread: config.spread ?? Math.PI / 3,
      speed: config.speed ?? [60, 120],
      particleLife: config.particleLife ?? 1.2,
      color: config.color ?? "#7dd3fc",
      rate: config.rate ?? 5,
      chain: config.chain ?? [],
      time: 0,
      lifespan: config.lifespan ?? null,
      age: 0,
    };
    emitters.push(emitter);

    if (config.initialBurst) {
      for (let i = 0; i < config.initialBurst; i++) {
        particles.push(createParticle(emitter));
      }
    }

    return emitter;
  }

  function runChain(chainLinks, particle) {
    for (const link of chainLinks) {
      if (Math.random() > (link.probability ?? 1)) continue;

      if (link.type === "burst") {
        const burstEmitter = {
          x: particle.sprite.x,
          y: particle.sprite.y,
          direction: rand(0, Math.PI * 2),
          spread: Math.PI * 2,
          speed: link.speed ?? [40, 90],
          particleLife: link.life ?? 0.6,
          color: link.color ?? "#f472b6",
          chain: [],
        };
        const count = link.count ?? 8;
        for (let i = 0; i < count; i++) {
          particles.push(createParticle(burstEmitter));
        }
      }

      if (link.type === "followEmitter") {
        createEmitter({
          x: particle.sprite.x,
          y: particle.sprite.y,
          direction: rand(0, Math.PI * 2),
          spread: Math.PI * 1.3,
          speed: link.speed ?? [30, 80],
          particleLife: link.life ?? 0.5,
          color: link.color ?? "#fbbf24",
          rate: link.rate ?? 12,
          chain: link.chain ?? [],
          lifespan: link.lifespan ?? 0.7,
        });
      }
    }
  }

  function update(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        if (p.chain && p.chain.length) {
          runChain(p.chain, p);
        }
        particleLayer.removeChild(p.sprite);
        p.sprite.destroy();
        particles.splice(i, 1);
        continue;
      }

      p.vy += 30 * dt;
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      p.sprite.alpha = 1 - p.age / p.life;
    }

    for (let i = emitters.length - 1; i >= 0; i--) {
      const e = emitters[i];
      e.time += dt * e.rate;
      e.age += dt;

      while (e.time >= 1) {
        particles.push(createParticle(e));
        e.time -= 1;
      }

      if (e.lifespan && e.age >= e.lifespan) {
        emitters.splice(i, 1);
      }
    }
  }

  function loadConfig(config) {
    if (!config || !Array.isArray(config.emitters) || !config.emitters.length) {
      throw new Error("No emitters found in config");
    }

    clearScene();
    currentConfig = config;

    for (const emitter of config.emitters) {
      createEmitter(emitter);
    }
  }

  function resize() {
    const { width, height } = stageEl.getBoundingClientRect();
    app.renderer.resize(width, height);
  }

  function getStageSize() {
    return { width: app.renderer.screen.width, height: app.renderer.screen.height };
  }

  let last = performance.now();
  app.ticker.add(() => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;
    update(dt);
  });

  return {
    app,
    resize,
    loadConfig,
    reloadCurrent: () => currentConfig && loadConfig(currentConfig),
    getCurrentConfig: () => currentConfig,
    getDefaultConfig: () => {
      const { width, height } = getStageSize();
      return createDefaultConfig(width, height);
    },
  };
}
