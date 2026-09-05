// Worker entry point. The form submits directly to Formspree, so this
// Worker's only job is serving the static site files.
export default {
  async fetch(request, env, ctx) {
    return env.ASSETS.fetch(request);
  },
};
