// Case metadata key set when "Solicitar Adiantamento/Peças" is used from the
// "Em andamento" form — filterable in the case listing the same way
// metadata.category is (see metadata[key]=value query convention in
// cases/page.tsx).
export const ADVANCE_REQUESTED_METADATA_KEY = 'advance_requested';
export const ADVANCE_REQUESTED_METADATA_VALUE = 'true';

// Stamped when a case enters Ongoing while ONGOING_WIZARD_V2_ENABLED is on.
// Cases without it keep the original Ongoing form, so flipping the flag never
// changes the flow of a case that is already in progress.
// A new version means adding it here: every Record<OngoingFlowVersion, ...>
// (the form and the details section) then fails to compile until it gets its
// own component.
export const ONGOING_FLOW_VERSIONS = ['v1', 'v2'] as const;
export type OngoingFlowVersion = (typeof ONGOING_FLOW_VERSIONS)[number];
export const ONGOING_FLOW_VERSION_METADATA_KEY = 'ongoing_flow_version';
export const ONGOING_FLOW_VERSION_V2_VALUE: OngoingFlowVersion = 'v2';

// Where the technician is in the v2 wizard and which service type they picked
// there. crmCase.type only becomes repair/inspection on the report submit, so
// the in-progress choice has to live here to survive a reload days later.
export const ONGOING_STEP_METADATA_KEY = 'ongoing_step';
export const ONGOING_SERVICE_TYPE_METADATA_KEY = 'ongoing_service_type';

// On a comment (comment.metadata): the v2 wizard step that posted it, so later
// uploads on that step go into the same comment instead of a new one.
export const COMMENT_ONGOING_STEP_METADATA_KEY = 'ongoing_step';
