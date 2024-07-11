export interface CreateAttachment {
  url: string;
  file_name: string;
  file_extension: string;
  size: number;
  key: string;
  created_by: string;
}

export interface Attachment {
  attachment_id: string;
  url: string;
  file_name: string;
  file_extension: string;
  size: number;
  key: string;
  created_by: string;
  created_at: string;
}
