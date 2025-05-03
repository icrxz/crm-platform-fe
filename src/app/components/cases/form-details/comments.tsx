import { parseDateTime } from "@/app/libs/date";
import { CaseFull } from "@/app/types/case";
import Image from 'next/image';
import { Card } from "../../common/card";
import { CardText } from "../../common/card/card-text";

interface CommentDetailsProps {
  crmCase: CaseFull;
}

export function CommentDetails({ crmCase }: CommentDetailsProps) {
  return (
    <div className="w-full h-fill">
      <Card title="Detalhes" titleSize="xl">
        <div className="mx-4">
          <div className="items-center space-y-4">
            <p className="text-sm font-medium text-gray-900">{crmCase.subject}</p>
          </div>

          {crmCase.comments && (
            <div className="mt-4">
              <h2 className={`text-m font-semibold`}>
                Comentários
              </h2>

              {crmCase.comments.map(comment => {
                return (
                  <div key={comment.comment_id} className="ml-2 mt-4 bg-white py-2 px-3 rounded-xl">
                    <div className="items-center mt-2 gap-8">
                      <div className="flex gap-4">
                        <CardText title="Data de criação:" text={parseDateTime(comment.created_at)} />
                        <CardText title="Criado por:" text={comment.created_by} />
                      </div>
                      <CardText title="Comentário:" text={comment.content} shouldCopy />
                    </div>

                    {comment.attachments && (
                      <div className="grid grid-cols-5 gap-4">
                        {comment.attachments.map(image => (
                          <div key={image.attachment_id} className="p-2 bg-gray-100 rounded-lg">
                            <a href={image.url} target="_blank">
                              <Image
                                src={image.url}
                                alt={image.file_name}
                                width={250}
                                height={250}
                                loading="lazy"
                                objectFit="cover"
                              />
                            </a>
                          </div>
                        ))}
                        {/* <ImageCarrousel images={comment.attachments} /> */}
                      </div>
                    )
                    }
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card >
    </div >
  );
}
