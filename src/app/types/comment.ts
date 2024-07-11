import { Attachment, CreateAttachment } from "./attachments";

export type CreateComment = {
  case_id: string;
  content: string;
  comment_type: CommentType;
  created_by: string;
  attachments?: CreateAttachment[];
};

export type Comment = {
  comment_id: string;
  case_id: string;
  content: string;
  comment_type: CommentType;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  attachments?: Attachment[];
};

export enum CommentType {
  CONTENT = "Content",
  COMMENT = "Comment",
  RESOLUTION = "Resolution",
  REJECTION = "Rejection",
}
