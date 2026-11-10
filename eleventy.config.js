import { HtmlBasePlugin } from "@11ty/eleventy";
import yaml from "js-yaml";
import { readFileSync } from "node:fs";

const ICONS = JSON.parse(readFileSync(new URL("./src/_data/icons.json", import.meta.url)));

export default function (eleventyConfig) {
  // Content files edited in Pages CMS are YAML
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  // Rewrites absolute links (/contact/) for the GitHub Pages sub-path (/demo-website/)
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  // Service pages, ordered for nav and cards
  eleventyConfig.addCollection("services", (api) =>
    api.getFilteredByGlob("src/services/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => (a.data.order || 99) - (b.data.order || 99))
  );
  // Town / service-area pages (add later in the CMS)
  eleventyConfig.addCollection("areas", (api) =>
    api.getFilteredByGlob("src/areas/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => a.data.title.localeCompare(b.data.title))
  );

  // Responsive photo: Unsplash URLs get a srcset; uploaded files are used as-is
  eleventyConfig.addShortcode("photo", (img, cls = "", sizes = "100vw", ratio = "3:2", eager = false) => {
    if (!img || !img.src) return "";
    const [rw, rh] = String(ratio).split(":").map(Number);
    const alt = String(img.alt || "").replace(/"/g, "&quot;");
    const load = eager ? 'fetchpriority="high"' : 'loading="lazy"';
    if (/^https:\/\/images\.unsplash\.com\//.test(img.src)) {
      const base = img.src.split("?")[0] + "?auto=format&fit=crop&q=80";
      const h = (w) => Math.round((w * rh) / rw);
      const srcset = [640, 960, 1400].map((w) => `${base}&w=${w}&h=${h(w)} ${w}w`).join(", ");
      return `<img class="${cls}" src="${base}&w=1400&h=${h(1400)}" srcset="${srcset}" sizes="${sizes}" width="1400" height="${h(1400)}" alt="${alt}" ${load} decoding="async">`;
    }
    return `<img class="${cls}" src="${img.src}" alt="${alt}" ${load} decoding="async">`;
  });

  // Counties as schema.org areas, e.g. "Bergen County, NJ"
  eleventyConfig.addFilter("county_schema", (areas) =>
    (areas.states || []).flatMap((st) => st.counties.map((c) => ({ "@type": "AdministrativeArea", name: `${c.name} County, ${st.abbr}` })))
  );
  // Every town -> "County, ST" for the town search
  eleventyConfig.addFilter("town_index", (areas) => {
    const out = {};
    for (const st of areas.states || []) for (const c of st.counties) for (const t of c.towns || []) out[t] = `${c.name} County, ${st.abbr}`;
    return out;
  });
  eleventyConfig.addShortcode("icon", (name, cls = "") =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`
  );
  // ["Bergen","Passaic","Essex"] -> "Bergen, Passaic & Essex"
  eleventyConfig.addFilter("and_list", (arr) => {
    const a = (arr || []).map(String);
    return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " & " + a[a.length - 1];
  });
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("slug_safe", (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("absolute", (path, site) => (site || "").replace(/\/$/, "") + path);
  eleventyConfig.addFilter("digits", (s) => String(s || "").replace(/\D/g, ""));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // Set by the GitHub workflow: "/demo-website/" before the domain moves, "/" after
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
