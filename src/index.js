// Worker entry point. Every request (static file or API call) passes
// through here first: /api/consult is handled directly, everything else
// falls through to the static site files uploaded alongside this Worker.
import { handleConsult } from "./consult.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/consult" && request.method === "POST") {
      return handleConsult(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
