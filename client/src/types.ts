export interface DefinitionGroup {
  id: number;
  words: string;
  definition: string;
}

export interface DictionaryConfig {
  title: string;
  creator: string;
  inLanguage: string;
  outLanguage: string;
  version: string;
  outputName: string;
  coverImage: File | null;
  copyright: string;
  usage: string;
  customStyles: string;
  definitionGroups: DefinitionGroup[];
}

export interface DictionaryEntry {
  word: string;
  definition: string;
}
