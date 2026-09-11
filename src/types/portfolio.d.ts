export interface LocalizedString {
  ru: string;
  en: string;
}

export interface ProjectAward {
  ru: string;
  en: string;
  url?: string | null;
}

export interface ProjectVideo {
  webm: string;
  mp4: string;
}

export interface Project {
  slug: string;
  year: number | string;
  client: LocalizedString;
  type: LocalizedString;
  url: string;
  site: string;
  categories: string[];
  star?: boolean;
  note?: LocalizedString | null;
  awards?: ProjectAward[] | null;
  awwwards?: (LocalizedString & { url?: string | null }) | null;
  video?: ProjectVideo | null;
  tags: string[];
  description: LocalizedString;
}

export interface AudioTrack {
  file: string;
  name: string;
  artist?: string;
  title?: string;
}

export interface LocalizedBootProject {
  slug: string;
  year: number | string;
  client: string;
  type: string;
  url: string;
  site: string;
  star: boolean;
  categories: string[];
  tags: string[];
  description: string;
  awards: Array<{ text: string; url: string | null }>;
  awwwards: { text: string; url: string | null } | null;
  shot: string;
  shotMod: string | null;
  shotModType: string | null;
  video: ProjectVideo | null;
  note: string | null;
}

export interface PlayerState {
  playing: boolean;
  trackIndex: number;
}
