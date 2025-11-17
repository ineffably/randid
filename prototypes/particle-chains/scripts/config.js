export function createDefaultConfig(width, height) {
  return {
    emitters: [
      {
        x: width * 0.4,
        y: height * 0.65,
        direction: -Math.PI / 2,
        spread: Math.PI / 5,
        speed: [90, 150],
        particleLife: 1.35,
        color: "#7dd3fc",
        rate: 7,
        chain: [
          {
            type: "burst",
            probability: 0.4,
            count: 12,
            color: "#f472b6",
            speed: [50, 120],
            life: 0.65,
          },
          {
            type: "followEmitter",
            probability: 0.7,
            rate: 14,
            speed: [40, 100],
            life: 0.55,
            lifespan: 0.8,
            color: "#fbbf24",
            chain: [
              {
                type: "burst",
                probability: 0.25,
                count: 6,
                color: "#f472b6",
                speed: [40, 90],
                life: 0.5,
              },
            ],
          },
        ],
      },
    ],
  };
}

export function parseConfig(text) {
  return JSON.parse(text);
}
