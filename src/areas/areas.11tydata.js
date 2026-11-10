// Town pages: /service-areas/wayne-nj/ . Drafts are not published.
const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export default {
  layout: "layouts/area.njk",
  eleventyComputed: {
    permalink: (d) => (d.draft ? false : `/service-areas/${slug(d.title)}/`),
    eleventyExcludeFromCollections: (d) => !!d.draft,
  },
};
