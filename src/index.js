// Worker entry point. Enforces the canonical origin
// (https://japanboundeducation.com) before serving static assets --
// www.japanboundeducation.com is a separate Cloudflare Custom Domain bound
// to this same Worker, and plain http:// reaches it too, with nothing
// redirecting between them until now. Path, query string, and hash are
// preserved exactly; only scheme and host are normalized.
const CANONICAL_ORIGIN = "https://japanboundeducation.com";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.origin !== CANONICAL_ORIGIN) {
      url.protocol = "https:";
      url.hostname = "japanboundeducation.com";
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
