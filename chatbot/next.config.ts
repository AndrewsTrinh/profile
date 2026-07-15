import type { NextConfig } from "next";
import path from "node:path";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  // This app imports web/src/data/resume.ts (the monorepo's shared resume
  // source of truth) from outside the chatbot/ project root — Turbopack
  // otherwise refuses to resolve files outside its detected root.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default withBotId(nextConfig);
