type searchPagination = {
  total: NonNullable<number>;
  perPage: NonNullable<number>;
  lastPage: NonNullable<number>;
  hasNext: NonNullable<boolean>;
};

type searchResultItems = {
  id: string | number;
  title: string;
  status?: string;
  image: string;
  latestChapter?: string;
  link: string;
  external?: any[] | any;
  nsfw?: boolean;
};

type searchResult<T> = {
  results: T[];
  meta: searchPagination;
};

type searchParams = {
  query: string;
  page?: number;
  safe?: boolean;
  sort?: "asc" | "desc";
  perPage?: number;
};

export type { searchResultItems, searchResult, searchParams };
