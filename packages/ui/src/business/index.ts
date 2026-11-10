// Public API of @vamos-ui/react/business — line items, flows & wizards, permission matrix.
// Heavy parsers (papaparse, read-excel-file, write-excel-file) load lazily on first use.

// Line items
export {
  LineItems,
  LineItemsSummary,
  lineItemsLabels,
  type LineItemsProps,
  type LineItemsSummaryProps,
  type LineItemsLabels,
  type LineItemColumn,
} from "./line-items";
export {
  computeLineTotals,
  createLineItem,
  createLineId,
  isLineValid,
  trLineTaxPack,
  vatLineTaxPack,
  type LineItem,
  type LineDiscount,
  type LineDiscountType,
  type LineTaxPack,
  type LineTaxRate,
  type LineWithholding,
  type LineResult,
  type LineTotals,
  type ComputeLineTotalsOptions,
} from "./line-items-core";

// Multi-step form
export {
  MultiStepForm,
  MultiStepFormStepper,
  MultiStepFormStep,
  MultiStepFormReview,
  MultiStepFormFooter,
  useMultiStepForm,
  multiStepFormLabels,
  type MultiStepFormProps,
  type MultiStepFormStepperProps,
  type MultiStepFormStepProps,
  type MultiStepFormReviewProps,
  type MultiStepFormReviewSection,
  type MultiStepFormFooterProps,
  type MultiStepFormLabels,
  type MultiStepStatus,
  type StepDef,
} from "./multi-step-form";

// Approval flow
export {
  ApprovalFlow,
  ApprovalStage,
  ApprovalSummary,
  ApprovalActions,
  approvalFlowLabels,
  type ApprovalFlowProps,
  type ApprovalStageProps,
  type ApprovalSummaryProps,
  type ApprovalActionsProps,
  type ApprovalFlowLabels,
  type ApprovalStageData,
  type ApprovalStageStatus,
  type ApprovalApprover,
  type ApprovalDecision,
  type ApprovalDecisionValue,
} from "./approval-flow";

// Import wizard
export {
  ImportWizard,
  ImportMapping,
  ImportReview,
  importWizardLabels,
  type ImportWizardProps,
  type ImportMappingProps,
  type ImportReviewProps,
  type ImportWizardLabels,
  type ImportContext,
  type ImportResult,
  type ImportReport,
  type ImportStrategy,
} from "./import-wizard";
export {
  sniffCsv,
  sniffDelimiter,
  decodeText,
  looksGarbled,
  parseCsv,
  readXlsx,
  autoMap,
  parseCell,
  parseDateCell,
  validateImport,
  validateImportRow,
  applyTemplate,
  mappingToTemplate,
  importCellMessages,
  type ImportField,
  type ImportFieldType,
  type ImportSheet,
  type ImportRowResult,
  type ImportCellMessages,
  type CsvEncoding,
  type CsvSniff,
  type ParsedCell,
  type MappingTemplate,
  type ValidateImportOptions,
} from "./import-core";

// Export
export {
  ExportDialog,
  ExportJobStatus,
  QuickExportButton,
  exportLabels,
  type ExportDialogProps,
  type ExportJobStatusProps,
  type QuickExportButtonProps,
  type ExportLabels,
  type ExportRequest,
  type ExportResult,
  type ExportJobState,
  type ExportScope,
} from "./export";
export {
  exportToBlob,
  toExportMatrix,
  exportFilename,
  downloadBlob,
  maskValue,
  type ExportColumn,
  type ExportFormat,
  type CsvExportOptions,
  type ExportToBlobOptions,
} from "./export-core";

// Setup checklist
export {
  SetupChecklist,
  SetupChecklistLauncher,
  setupChecklistLabels,
  type SetupChecklistProps,
  type SetupChecklistLauncherProps,
  type SetupChecklistLabels,
  type SetupItem,
  type SetupItemStatus,
} from "./setup-checklist";

// Permission matrix
export {
  PermissionMatrix,
  PermissionMatrixCell,
  PermissionDiff,
  PermissionCompare,
  permissionMatrixLabels,
  type PermissionMatrixProps,
  type PermissionMatrixCellProps,
  type PermissionDiffProps,
  type PermissionCompareProps,
  type PermissionMatrixLabels,
  type PermissionResource,
  type PermissionAction,
} from "./permission-matrix";
export {
  diffPermissions,
  applyDependencies,
  effectiveLevel,
  scopeRank,
  isGranted,
  setMany,
  setPermission,
  SCOPE_ORDER,
  type PermissionScope,
  type PermissionLevel,
  type PermissionValue,
  type PermissionDependency,
  type PermissionChange,
} from "./permission-core";
