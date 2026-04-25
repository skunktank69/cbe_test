const baseUrl = "https://mangadot.net";
const getLastPage = (t: any, p: any) => {
  if (p <= 0) throw new RangeError("perPage must be > 0");
  if (t <= 0) return 0;

  const b = (t / p) | 0;
  return b + (t % p !== 0 ? 1 : 0);
};
export async function search(
  query: string,
  page: number = 1,
  perPage: number = 20,
  ...args: any[]
) {
  const url = `${baseUrl}/api/search?page=${page}&search=${query}&perPage=${perPage}&sortBy=relevance&displayMode=minimal`;
  const dat = await (await fetch(url)).json();
  const tot = dat.pagination.total_results;
  const res = dat.manga_list;
  const results: any = [];

  res.forEach((_: any) => {
    results.push({
      id: {
        source: _.id,
      },
      title: {
        source: _.title,
        original: _.title,
        alternatives: _.alt_titles,
      },
      synopsis: {
        source: _.description,
      },
      genres: _.genres,
      images: {
        cover: _.photo,
      },
      date: _.date_added,
      country: _.country_of_origin,
      ratings: {
        source: _.avg_rating,
        total: _.rating_count,
      },
      hiatus: _.hiatus,
      status: _.status,
      chapters: _.chapter_count,
    });
  });

  const response = {
    query,
    page,
    perPage,
    totalResults: tot,
    getLastPage: getLastPage(tot, perPage),
    results,
  };
  return response;
}

export async function getDetails(id: string) {
  return null;
}
