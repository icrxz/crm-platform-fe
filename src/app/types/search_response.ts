export type SearchResponse<T> = {
  result: T[];
  paging: {
    total: number;
    limit: number;
    offset: number;
  };
}