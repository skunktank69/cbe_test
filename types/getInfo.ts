enum STATUS {
  ongoing = "ongoing",
  finished = "finished",
  on_hiatus = "on_hiatus",
  discontinued = "discontinued",
  upcoming = "upcoming",
}

type chapter = {
  number: number;
  id: string;
  link: string;
  title: string;
};

type mangaItem = {
  title: string;
  image: string;
  synopsis: string;
  status: STATUS;
  year: string | number;
  genre: Array<string> | string;
  chapters: Array<chapter>;
};

type infoParams = {
  id: string;
};

export type { infoParams, mangaItem, chapter, STATUS };
