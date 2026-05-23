import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.mangakakalot.gg";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  Referer: "https://www.mangakakalot.gg/",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

type Manga = {
  id: string;
  title: string;
  image?: string;
  latestChapter?: string;
  views?: number;
};

type Chapter = {
  id: string;
  title: string;
  views?: number;
  date?: string;
};

async function fetchHtml(url: string) {
  const { data } = await axios.get(url, {
    headers,
  });

  return cheerio.load(data);
}

function parseId(url: string = ""): string {
  return url.split("/manga/")[1] || url.split("/").pop() || "";
}

function parseMangaList($: cheerio.CheerioAPI): Manga[] {
  const mangas: Manga[] = [];

  $(".list-truyen-item-wrap").each((_, el) => {
    const titleEl = $(el).find("h3 a");

    mangas.push({
      id: parseId(titleEl.attr("href")),
      title: titleEl.text().trim(),
      image: $(el).find("img").attr("src"),
      latestChapter: $(el).find(".list-story-item-wrap-chapter").text().trim(),
      views:
        parseInt($(el).find("span.aye_icon").text().replace(/,/g, "")) || 0,
    });
  });

  return mangas;
}

async function search(query: string, page: number = 1): Promise<Manga[]> {
  const url = `${BASE_URL}/search/story/${encodeURIComponent(
    query,
  )}${page > 1 ? `?page=${page}` : ""}`;

  const $ = await fetchHtml(url);

  const mangas: Manga[] = [];

  $(".panel_story_list .story_item").each((_, el) => {
    const link = $(el).find(".story_name a");

    mangas.push({
      id: parseId(link.attr("href")),
      title: link.text().trim(),
      image: $(el).find("img").attr("src"),
    });
  });

  return mangas;
}

async function getInfo(id: string) {
  const $ = await fetchHtml(`${BASE_URL}/manga/${id}`);

  const genres: string[] = [];

  $(".manga-info-text li.genres a").each((_, el) => {
    genres.push($(el).text().trim());
  });

  return {
    id,
    title: $(".manga-info-text h1").text().trim(),

    altTitles: $(".story-alternative")
      .text()
      .replace("Alternative :", "")
      .trim(),

    image: $(".manga-info-pic img").attr("src"),

    author: $(".manga-info-text li:contains('Author')")
      .text()
      .replace("Author(s) :", "")
      .trim(),

    status: $(".manga-info-text li:contains('Status')")
      .text()
      .replace("Status :", "")
      .trim(),

    genres,

    description: $("#contentBox").text().trim(),
  };
}

async function getLatest(page: number = 1): Promise<Manga[]> {
  const $ = await fetchHtml(
    `${BASE_URL}/manga-list/latest-manga${page > 1 ? `?page=${page}` : ""}`,
  );

  return parseMangaList($);
}

async function getPopular(page: number = 1): Promise<Manga[]> {
  const $ = await fetchHtml(
    `${BASE_URL}/manga-list/hot-manga${page > 1 ? `?page=${page}` : ""}`,
  );

  return parseMangaList($);
}

async function getChapterList(id: string): Promise<Chapter[]> {
  const $ = await fetchHtml(`${BASE_URL}/manga/${id}`);

  const chapters: Chapter[] = [];

  $(".chapter-list .row").each((_, el) => {
    const link = $(el).find("span:first-child a");

    chapters.push({
      id: parseId(link.attr("href")),
      title: link.text().trim(),

      views:
        parseInt($(el).find("span:nth-child(2)").text().replace(/,/g, "")) || 0,

      date: $(el).find("span:last-child").text().trim(),
    });
  });

  return chapters;
}

async function getPages(mangaId: string, chapterId: string) {
  const $ = await fetchHtml(`${BASE_URL}/manga/${mangaId}/${chapterId}`);

  const pages: string[] = [];

  $(".container-chapter-reader img").each((_, el) => {
    const src = $(el).attr("src");

    if (src) {
      pages.push(src);
    }
  });

  return {
    id: chapterId,

    title: $(".info-top-chapter h2").text().trim(),

    pages,
  };
}

(globalThis as any).Extension = {
  search,
  getInfo,
  getLatest,
  getPopular,
  getPages,
  getChapterList,
};

search("one piece");
