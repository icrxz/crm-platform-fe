import { Attachment, AttachmentDocumentType } from '@/app/types/attachments';
import { Comment, CommentType } from '@/app/types/comment';
import {
  buildWizardSteps,
  findStepComment,
  getOngoingFlowVersion,
  isStepDone,
  missingForReport,
  REPORT_STEP,
  resolveCurrentStep,
  stepAttachments,
  TECHNICIAN_PHOTOS_STEP,
} from '../ongoing_wizard';

const { PHOTO, SERVICE_ORDER, CUSTOMER_CONFIRMATION, WARRANTY_TERM } =
  AttachmentDocumentType;

function resolution(
  id: string,
  documentTypes: AttachmentDocumentType[],
  metadata?: Record<string, string>
): Comment {
  return {
    comment_id: id,
    comment_type: CommentType.RESOLUTION,
    metadata,
    attachments: documentTypes.map(
      (document_type, index) =>
        ({ attachment_id: `${id}-${index}`, document_type }) as Attachment
    ),
  } as Comment;
}

describe('buildWizardSteps', () => {
  it('keeps only photos and the report when nothing is required', () => {
    expect(buildWizardSteps([]).map((step) => step.key)).toEqual([
      TECHNICIAN_PHOTOS_STEP,
      REPORT_STEP,
    ]);
  });

  it('adds a step per paperwork group the case requires', () => {
    expect(
      buildWizardSteps([SERVICE_ORDER, CUSTOMER_CONFIRMATION]).map(
        (step) => step.title
      )
    ).toEqual([
      'Fotos do técnico',
      'Ordem de serviço',
      'Confirmação do cliente',
      'Envio para o laudo',
    ]);
  });

  it('collects the warranty term in the customer confirmation step', () => {
    const steps = buildWizardSteps([
      SERVICE_ORDER,
      CUSTOMER_CONFIRMATION,
      WARRANTY_TERM,
    ]);

    expect(steps).toHaveLength(4);
    expect(steps[2].documentTypes).toEqual([
      CUSTOMER_CONFIRMATION,
      WARRANTY_TERM,
    ]);
  });
});

describe('resolveCurrentStep', () => {
  const steps = buildWizardSteps([SERVICE_ORDER]);

  it('keeps a saved step that still exists', () => {
    expect(resolveCurrentStep(steps, 'service_order')).toBe('service_order');
  });

  it('falls back to the photos for a missing or stale step', () => {
    expect(resolveCurrentStep(steps, undefined)).toBe(TECHNICIAN_PHOTOS_STEP);
    expect(resolveCurrentStep(steps, 'customer_confirmation')).toBe(
      TECHNICIAN_PHOTOS_STEP
    );
  });
});

describe('step progress', () => {
  const confirmationStep = buildWizardSteps([
    CUSTOMER_CONFIRMATION,
    WARRANTY_TERM,
  ])[1];

  it('completes a step only when every document it holds was sent', () => {
    expect(
      isStepDone([resolution('c1', [CUSTOMER_CONFIRMATION])], confirmationStep)
    ).toBe(false);
    expect(
      isStepDone(
        [
          resolution('c1', [CUSTOMER_CONFIRMATION]),
          resolution('c2', [WARRANTY_TERM]),
        ],
        confirmationStep
      )
    ).toBe(true);
  });

  it('never completes the report step', () => {
    const reportStep = buildWizardSteps([]).at(-1)!;
    expect(isStepDone([resolution('c1', [PHOTO])], reportStep)).toBe(false);
  });

  it('lists the step files from every technician comment', () => {
    expect(
      stepAttachments(
        [
          resolution('c1', [CUSTOMER_CONFIRMATION, PHOTO]),
          resolution('c2', [WARRANTY_TERM]),
        ],
        confirmationStep
      ).map((attachment) => attachment.attachment_id)
    ).toEqual(['c1-0', 'c2-0']);
  });
});

describe('missingForReport', () => {
  it('always asks for photos, plus whatever the case requires', () => {
    expect(missingForReport([], [SERVICE_ORDER])).toEqual([
      PHOTO,
      SERVICE_ORDER,
    ]);
  });

  it('is empty once everything was sent', () => {
    expect(
      missingForReport(
        [resolution('c1', [PHOTO, SERVICE_ORDER])],
        [SERVICE_ORDER]
      )
    ).toEqual([]);
  });
});

describe('findStepComment', () => {
  it('finds the latest technician comment tagged with the step', () => {
    const comments = [
      resolution('old', [], { ongoing_step: 'service_order' }),
      resolution('other', [], { ongoing_step: 'technician_photos' }),
      resolution('new', [], { ongoing_step: 'service_order' }),
    ];

    expect(findStepComment(comments, 'service_order')?.comment_id).toBe('new');
  });

  it('ignores untagged comments and comments that are not from the technician', () => {
    const comments = [
      resolution('untagged', [SERVICE_ORDER]),
      {
        comment_id: 'plain',
        comment_type: CommentType.COMMENT,
        metadata: { ongoing_step: 'service_order' },
      } as unknown as Comment,
    ];

    expect(findStepComment(comments, 'service_order')).toBeUndefined();
    expect(findStepComment(undefined, 'service_order')).toBeUndefined();
  });
});

describe('getOngoingFlowVersion', () => {
  it('returns the version stamped on the case', () => {
    expect(
      getOngoingFlowVersion({ metadata: { ongoing_flow_version: 'v2' } })
    ).toBe('v2');
    expect(
      getOngoingFlowVersion({ metadata: { ongoing_flow_version: 'v1' } })
    ).toBe('v1');
  });

  it('falls back to v1 for an unstamped case or an unknown version', () => {
    expect(getOngoingFlowVersion({ metadata: {} })).toBe('v1');
    expect(getOngoingFlowVersion({})).toBe('v1');
    expect(
      getOngoingFlowVersion({ metadata: { ongoing_flow_version: 'v9' } })
    ).toBe('v1');
  });
});
