import axios from "axios";
import { load } from "cheerio";
import type {
  searchParams,
  searchResult,
  searchResultItems,
} from "../types/search";
import { type STATUS, type chapter } from "../types/getInfo";
import { type infoParams, type mangaItem } from "../types/getInfo";

axios.defaults.withCredentials = true;

export const BASE_URL = "https://mangapill.com";

console.log(BASE_URL);
/*
search - o
getInfo - o
getLatest - o
getPopular - o
getPages - o
getChapterList - x
getImage -
 */

/**
 * Search manga titles from Mangapill.
 *
 * Scrapes the Mangapill search page and returns a normalized
 * list of manga entries along with basic pagination metadata.
 *
 * Since Mangapill does not expose total result counts publicly,
 * `total` and `lastPage` are returned as `NaN`.
 *
 * @async
 * @function search
 *
 * @param {searchParams} params - Search configuration options.
 * @param {string} params.query - Manga title or keyword to search for.
 * @param {number} [params.page=1] - Search results page number.
 *
 * @returns {Promise<searchResult<searchResultItems>>}
 * Resolves with scraped manga search results and pagination metadata.
 *
 * @example
 * ```ts
 * const results = await search({
 *   query: "one piece",
 *   page: 1,
 * });
 *
 * console.log(results.results);
 * ```
 *
 * @example
 * ```ts
 * const results = await search({
 *   query: "berserk",
 *   page: 3,
 * });
 *
 * console.log(results.meta.hasNext);
 * ```
 *
 * @throws {AxiosError}
 * Throws if the request to Mangapill fails.
 *
 * @throws {Error}
 * Throws if the HTML structure changes and scraping selectors fail.
 *
 * @remarks
 * - Uses Cheerio to parse Mangapill HTML responses.
 * - Pagination detection is based on the presence of a "Next" button.
 * - Result links are normalized by removing the leading slash.
 */

async function search({
  query,
  page = 1,
}: searchParams): Promise<searchResult<searchResultItems>> {
  const { data } = await axios.get(
    `${BASE_URL}/search?q=${query}&status=&type=&page=${page}`,
    {
      headers: {
        Host: "mangapill.com",
        Referer:
          "https://mangapill.com/search?q=one+piece&status=&type=&page=1",
        // Cookie:
        //   "session=bafBcfhs4TswHhOjhKgsS9ygk8vJPjZ34YhFlNue;cf_clearance=;",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
      },
    },
  );
  const $ = load(data);
  let results: searchResultItems[] = [];

  $(".my-3.grid.justify-end.gap-3 > div ").each((_, el) => {
    results.push({
      image: $(el).find("img").attr("data-src") as string,
      id: $(el)
        .find("a.relative.block")
        .attr("href")
        ?.replace("/", "") as string,
      title: $(el).find("div > a > div.font-black").text().trim(),
      link: $(el)
        .find("a.relative.block")
        .attr("href")
        ?.replace("/", "") as string,
    });
  });
  const hasNext =
    $("div.justify-center > a.btn.btn-sm").text().split(" ").indexOf("Next") >=
    0
      ? true
      : false;

  return {
    results,
    meta: {
      total: NaN,
      perPage: 50,
      hasNext,
      lastPage: NaN,
    },
  };
}

async function getInfo({ id }: infoParams): Promise<mangaItem> {
  const { data } = await axios.get(`${BASE_URL}/manga/${id}`, {
    // /id/slug
    headers: {
      Host: "mangapill.com",
      Referer: `https://mangapill.com/manga/${id}`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
    },
  });
  const $ = load(data);
  function ee(i: string): STATUS {
    enum k {
      ongoing = "ongoing",
      finished = "finished",
      on_hiatus = "on_hiatus",
      discontinued = "discontinued",
      upcoming = "upcoming",
    }

    if (i === "publishing") {
      //@ts-expect-error
      return k.ongoing;
    }
    //@ts-expect-error
    return k[i as keyof typeof k];
  }
  const chapters: Array<chapter> = [];
  $("#chapters > .my-3 > .border-border").each((_, el) => {
    chapters.push({
      title: String($(el).attr("title")),
      number: Number(
        $(el).attr("href")?.split("/")[3]?.split("-chapter-")[1] as undefined,
      ),
      id: String($(el).attr("href")?.split("/chapters/").join("")),
      link: String($(el).attr("href")),
    });
  });
  const genre: string[] = [];
  $("a.text-sm.mr-1.text-brand").each((_, el) => {
    genre.push($(el).text().trim());
  });
  const result: mangaItem = {
    title: $("div > div > h1.font-bold").text().trim(),
    image: String($(".flex-shrink-0 > img").attr("data-src")),
    status: ee($(".grid-cols-1 > div:nth-of-type(2) > div").text().trim()),
    year: Number($(".grid-cols-1 > div:nth-of-type(3) > div").text().trim()),

    synopsis: String($(".mb-3 > .text-sm.text--secondary").text().trim()),
    chapters,
    genre,
  };

  return result;
}

/**
 * Fetches the latest manga entries from MangaPill.
 *
 * Sends a request to the MangaPill "new mangas" endpoint,
 * parses the HTML response, and extracts manga metadata
 * including id, title, image, and link.
 *
 * @async
 * @function getLatest
 * @param {...any[]} args - Unused arguments placeholder to satisfy linter rules.
 * @returns {Promise<void>} Resolves after scraping and collecting latest manga data.
 *
 * @example
 * await getLatest();
 */

async function getLatest(...args: any[]) {
  // param for compatibility with other sources, not used in mangapill
  // just so linter does not give unused warning
  args;
  const { data } = await axios.get(`${BASE_URL}/mangas/new`, {
    headers: {
      Host: "mangapill.com",
      Referer: `https://mangapill.com/mangas/new`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
    },
  });
  const $ = load(data);
  const card = $(".grid.justify-end.gap-3.grid-cols-2 > div");
  const latest: Array<{
    id: string;
    title: string;
    image: string;
    link: string;
  }> = [];
  card.each((_, el) => {
    latest.push({
      id: $(el)
        .find("a.relative.block")
        .attr("href")
        ?.replace("/manga/", "") as string,
      title: $(el).find("div > a > div.font-black").text().trim(),
      image: $(el).find("img").attr("data-src") as string,
      link: $(el)
        .find("a.relative.block")
        .attr("href")
        ?.replace("/", "") as string,
    });
  });
  return latest;
}

/**
 * Fetches popular manga entries from MangaPill homepage.
 *
 * Sends a request to the MangaPill homepage, parses the HTML response,
 * and extracts popular manga metadata including id, title, image, and link.
 *
 * @async
 * @function getPopular
 * @param {...any[]} args - Optional unused arguments placeholder.
 * @returns {Promise<Array<{
 *   id: string;
 *   title: string;
 *   image: string;
 *   link: string;
 * }>>} A promise that resolves to an array of popular manga items.
 *
 * @example
 * const popular = await getPopular();
 * console.log(popular);
 */
async function getPopular(...args: any[]) {
  const data = await axios.get(`${BASE_URL}`, {
    headers: {
      Host: "mangapill.com",
      Referer: `https://mangapill.com/`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
    },
  });
  const $ = load(data.data);
  const card = $(".my-3.grid.justify-end.gap-3.grid-cols-2  > div");
  const items: Array<{
    id: string;
    title: string;
    image: string;
    link: string;
  }> = [];
  card.each((_, el) => {
    items.push({
      id: $(el)
        .find("a.relative.block")
        .attr("href")
        ?.replace("/manga/", "") as string,
      title: $(el).find("div > a > div.font-black").text().trim(),
      image: $(el).find("img").attr("data-src") as string,
      link: $(el)
        .find("a.relative.block")
        .attr("href")
        ?.replace("/", "") as string,
    });
  });
  return items;
}

async function getPages({ chapter }: { chapter: string }) {
  const { data } = await axios.get(`${BASE_URL}/chapters/${chapter}`, {
    headers: {
      Host: "mangapill.com",
      Referer: `https://mangapill.com/chapters/${chapter}`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
    },
  });
  const $ = load(data);
  const pages: string[] = [];
  $(".relative.bg-card.flex.justify-center.items-center > picture > img").each(
    (_, el) => {
      pages.push($(el).attr("data-src") as string);
    },
  );
  return pages;
}

async function getImage(image: string): Promise<string> {
  const im = await axios.get(image, {
    headers: {
      Referer: "https://mangapill.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
    },
  });

  return im.data;
}

(globalThis as any).Extension = {
  BASE_URL,
  search,
  getInfo,
  getLatest,
  getPopular,
  getPages,
  getImage,
};
