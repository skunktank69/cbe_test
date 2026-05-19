import axios from "axios";
import * as cheerio from "cheerio";

const baseUrl = "https://zinmanga.net";

export async function search(query: string, page: number = 1) {
  const { data } = await axios.get(
    `${baseUrl}/page/${page}?post_type=wp-manga&s=${encodeURIComponent(query)}`,
  );

  const $ = cheerio.load(data);

  const results = $(".row.c-tabs-item__content")
    .map((_, el) => {
      const link = $(el).find(".post-title > h3 > a");

      const title = link.text().trim();

      const href = link.attr("href") || "";
      const id = href.split("/manga/")[1]?.replace("/", "");

      const image = $(el).find("img").attr("data-src") || "";

      return {
        title,
        id,
        image,
      };
    })
    .get();

  console.log(results);
  return results;
}
