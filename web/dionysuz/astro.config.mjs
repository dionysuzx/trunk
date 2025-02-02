// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "dionysuz",
      customCss: ["./src/styles/custom.css"],
      social: {
        github: "https://github.com/dionysuzx",
        "x.com": "https://x.com/dionysuzx",
      },
      pagefind: false,
    }),
  ],
});
