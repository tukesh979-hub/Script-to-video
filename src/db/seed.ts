import { randomUUID } from "node:crypto";
import { db } from "./index";
import { projects } from "./schema";

/**
 * Seeds with the real projects built this session, so the Dashboard shows
 * something true rather than lorem-ipsum placeholders.
 */
const SEED_PROJECTS = [
  {
    name: "Navneet / Porsche 911 Reel",
    description:
      "Real hackathon talking-head footage + 10 motion-design beats + End Frame CTA, real VO-driven timing.",
    status: "ready" as const,
    thumbnailUrl: "/thumbnails/navneet-porsche-reel.jpg",
    durationSeconds: 48,
  },
  {
    name: "Porsche 911 Taste Test",
    description: "Fully AI-generated motion-design video, synthetic VO + generated illustrations.",
    status: "ready" as const,
    thumbnailUrl: "/thumbnails/porsche-911-taste-test.jpg",
    durationSeconds: 44,
  },
  {
    name: "Testimonial Ad",
    description: "Reveal-animation testimonial ad build.",
    status: "ready" as const,
    thumbnailUrl: "/thumbnails/testimonial-ad.jpg",
    durationSeconds: 30,
  },
];

for (const p of SEED_PROJECTS) {
  db.insert(projects)
    .values({ id: randomUUID(), ...p })
    .run();
}

console.log(`Seeded ${SEED_PROJECTS.length} projects.`);
