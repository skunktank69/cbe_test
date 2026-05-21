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

export async function getInfo(id: string) {
  const data = await axios.get(`${baseUrl}/manga/${id}`);

  const $ = cheerio.load(data.data);
  const title = $(".post-title > h1").text().trim();
  const image = $(".summary_image > a > img").attr("src") || "";
  const chapters = $(".wp-manga-chapter").text().trim();
  // .each((_,el) => {
  //    return {
  //     title: $(el).find("span > a").text().trim(),
  //     chapterNumber:$(el).find("span > a").attr("data-id"),
  //    }
  // }).get()

  return {
    title,
    image,
    chapters,
  };
}

(globalThis as any).Extension = {
  search,
  getInfo,
};

// getManga("one-piece-official").then(console.log);
