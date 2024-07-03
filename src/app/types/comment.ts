export type Comment = {
  comment_id: string;
  case_id: string;
  content: string;
  comment_type: CommentType;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
};

export enum CommentType {
  CONTENT = "Content",
  COMMENT = "Comment",
  RESOLUTION = "Resolution",
  REJECTION = "Rejection",
}
