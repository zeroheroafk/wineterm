import {
  DATA_CLASSIFICATION_LABELS,
  type DataClassification,
} from "@/services/markets/sources";
import {
  OBSERVATION_SOURCE_LABELS,
  type ObservationSourceType,
  type VerificationStatus,
} from "@/services/markets/types";

const TAG_BASE = "wt-label inline-flex items-center border px-1.5 py-0.5";

const CLASSIFICATION_STYLES: Record<DataClassification, string> = {
  official: "border-wine text-wine",
  reported: "border-rule text-ink-soft",
  indicative: "border-ochre text-ochre",
  modelled: "border-ochre text-ochre",
  estimated: "border-ochre text-ochre",
};

/** Data classification of a source: official, reported, indicative, ... */
export function DataClassificationTag({
  classification,
}: {
  classification: DataClassification;
}) {
  return (
    <span className={`${TAG_BASE} ${CLASSIFICATION_STYLES[classification]}`}>
      {DATA_CLASSIFICATION_LABELS[classification]}
    </span>
  );
}

const SOURCE_TYPE_STYLES: Record<ObservationSourceType, string> = {
  official: "border-wine text-wine",
  contract: "border-rule text-ink",
  "coop-settlement": "border-rule text-ink",
  "buyer-announcement": "border-ochre text-ochre",
  "reported-range": "border-rule text-ink-soft",
  "wineterm-estimate": "border-ochre bg-ochre/10 text-ochre",
};

/** How an observation was established (grape provenance in particular). */
export function SourceTypeTag({ type }: { type: ObservationSourceType }) {
  return (
    <span className={`${TAG_BASE} ${SOURCE_TYPE_STYLES[type]}`}>
      {OBSERVATION_SOURCE_LABELS[type]}
    </span>
  );
}

const VERIFICATION_STYLES: Record<VerificationStatus, string> = {
  verified: "border-rule text-ink",
  reported: "border-rule text-ink-soft",
  unverified: "border-ochre text-ochre",
};

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  verified: "Verified",
  reported: "Reported",
  unverified: "Unverified",
};

export function VerificationTag({ status }: { status: VerificationStatus }) {
  return (
    <span className={`${TAG_BASE} ${VERIFICATION_STYLES[status]}`}>
      {VERIFICATION_LABELS[status]}
    </span>
  );
}
