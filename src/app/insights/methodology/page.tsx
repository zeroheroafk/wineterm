import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import {
  DataClassificationTag,
  SourceTypeTag,
  VerificationTag,
} from "@/components/markets/tags";
import { TD, TH } from "@/components/markets/cells";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryNavigation } from "@/lib/navigation";
import {
  DATA_CLASSIFICATION_LABELS,
  SOURCE_REGISTRY,
  type DataClassification,
} from "@/services/markets/sources";
import {
  FAMILY_REFERENCE_UNIT,
  OBSERVATION_SOURCE_LABELS,
  UNIT_FAMILY,
  type ObservationSourceType,
  type SeriesUnit,
} from "@/services/markets/types";
import type { DataStatus } from "@/services/types";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How WineTerm series are collected, classified and defined: sources, data classifications, units, normalisation, campaigns, balances, harvest reporting and revisions.",
};

const CLASSIFICATION_NOTES: Record<DataClassification, string> = {
  official:
    "Published by a public body or under a statutory reporting scheme. Taken as the reference where available.",
  reported:
    "Collected from market participants (operators, cooperatives, observatories) without statutory backing.",
  indicative:
    "Quotations that describe the tone of a market rather than settled transactions, such as broker levels.",
  modelled:
    "Derived by WineTerm from other series through a stated calculation, never presented as an observation.",
  estimated:
    "WineTerm desk estimates from scattered observations, clearly labelled and replaced when published figures arrive.",
};

const SOURCE_TYPE_NOTES: Record<ObservationSourceType, string> = {
  official: "A price published by an official bulletin or scheme.",
  contract: "Averages of registered purchase contracts.",
  "coop-settlement":
    "Cooperative settlement prices, which arrive months after delivery.",
  "buyer-announcement":
    "Opening prices announced by buyers ahead of a harvest; not settled transactions.",
  "reported-range":
    "Mid-points of traded ranges reported by market contacts.",
  "wineterm-estimate":
    "A WineTerm desk estimate where no published series exists.",
};

const STATUS_NOTES: Record<DataStatus, string> = {
  final: "The source has closed the figure; only formal corrections follow.",
  provisional: "Published by the source but still subject to routine revision.",
  estimate: "A quantified assessment ahead of publication by the source.",
  forecast: "Forward-looking, expressed as a range wherever possible.",
  illustrative:
    "Development sample data demonstrating the interface; never a real observation.",
};

const UNITS: SeriesUnit[] = [
  "EUR/hl",
  "EUR/litre",
  "EUR/kg",
  "EUR/100kg",
  "EUR/tonne",
];

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 max-w-2xl space-y-3 text-[0.95rem] leading-relaxed text-ink">
      {children}
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[4]}
        crumbs={[
          { label: "Insights", href: "/insights" },
          { label: "Methodology" },
        ]}
        kicker="Insights"
        title="Methodology"
        description="How WineTerm series are collected, classified and defined. This page is the reference for every label used across the platform."
        activeHref="/insights/methodology"
      />

      <section className="mt-10">
        <SectionHeader kicker="Scope" title="What WineTerm publishes" />
        <Prose>
          <p>
            WineTerm maintains price series for bulk wine, grapes, and must
            and concentrates; supply balances covering stocks, production,
            availability, use and trade; harvest field reporting; and customs
            trade aggregates. Coverage starts with Spain and Portugal, with
            comparative series for France and Italy.
          </p>
          <p>
            Every observation carries its source, unit, observation date,
            publication date, last update and status. Where a figure is
            derived rather than observed, the derivation is stated next to
            it.
          </p>
        </Prose>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Provenance"
          title="Data classifications"
          description="Every source in the registry carries one classification, shown as a tag wherever its figures appear."
        />
        <ul className="mt-5 max-w-3xl divide-y divide-rule border-y border-rule">
          {(
            Object.keys(DATA_CLASSIFICATION_LABELS) as DataClassification[]
          ).map((classification) => (
            <li
              key={classification}
              className="grid grid-cols-1 gap-x-6 gap-y-1.5 py-3 sm:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <span>
                <DataClassificationTag classification={classification} />
              </span>
              <span className="text-sm leading-relaxed text-ink-soft">
                {CLASSIFICATION_NOTES[classification]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Provenance"
          title="How observations are established"
          description="Grape prices in particular differ row by row in how they were established. The source type says how; the verification tag says how far WineTerm has confirmed it."
        />
        <ul className="mt-5 max-w-3xl divide-y divide-rule border-y border-rule">
          {(
            Object.keys(OBSERVATION_SOURCE_LABELS) as ObservationSourceType[]
          ).map((type) => (
            <li
              key={type}
              className="grid grid-cols-1 gap-x-6 gap-y-1.5 py-3 sm:grid-cols-[11rem_minmax(0,1fr)]"
            >
              <span>
                <SourceTypeTag type={type} />
              </span>
              <span className="text-sm leading-relaxed text-ink-soft">
                {SOURCE_TYPE_NOTES[type]}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex max-w-3xl flex-wrap items-center gap-2 text-sm text-ink-soft">
          Verification states:
          <VerificationTag status="verified" />
          confirmed against the publishing source;
          <VerificationTag status="reported" />
          received from a reporting network;
          <VerificationTag status="unverified" />
          not yet confirmed and treated with caution.
        </p>
        <Prose>
          <p>
            Grape markets are fragmented and regional. WineTerm publishes
            individual observations with their provenance and does not
            aggregate them into a national index; no average across
            observations represents a national grape price.
          </p>
        </Prose>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Lifecycle"
          title="Data statuses"
          description="Each figure carries a lifecycle status, from first estimate to final."
        />
        <ul className="mt-5 max-w-3xl divide-y divide-rule border-y border-rule">
          {(Object.keys(STATUS_NOTES) as DataStatus[]).map((status) => (
            <li
              key={status}
              className="grid grid-cols-1 gap-x-6 gap-y-1.5 py-3 sm:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <span>
                <DataStatusLabel status={status} />
              </span>
              <span className="text-sm leading-relaxed text-ink-soft">
                {STATUS_NOTES[status]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Units"
          title="Units and normalisation"
          description="Observations keep the unit their source publishes. Nothing is converted silently."
        />
        <Prose>
          <p>
            Units belong to a physical family: volume (per hectolitre, per
            litre) or mass (per kilogram, per 100 kilograms, per tonne).
            Normalisation happens only within a family, to the family&apos;s
            reference unit, and normalised values are always labelled with a
            marker and shown alongside the original observation, never
            instead of it. Volume and mass quotations are never converted
            into each other.
          </p>
        </Prose>
        <div className="mt-5 max-w-xl overflow-x-auto border border-rule bg-paper">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Units, their families and reference units
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className={TH}>
                  Unit
                </th>
                <th scope="col" className={TH}>
                  Family
                </th>
                <th scope="col" className={TH}>
                  Normalises to
                </th>
              </tr>
            </thead>
            <tbody>
              {UNITS.map((unit) => (
                <tr key={unit} className="border-b border-rule last:border-b-0">
                  <td className={`${TD} font-mono text-sm text-ink`}>{unit}</td>
                  <td className={`${TD} text-sm text-ink-soft`}>
                    {UNIT_FAMILY[unit]}
                  </td>
                  <td className={`${TD} font-mono text-sm text-ink-soft`}>
                    {FAMILY_REFERENCE_UNIT[UNIT_FAMILY[unit]] === unit
                      ? "reference unit"
                      : FAMILY_REFERENCE_UNIT[UNIT_FAMILY[unit]]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Definitions"
          title="Campaigns and the supply balance"
        />
        <Prose>
          <p>
            Marketing campaigns run from 1 August to 31 July and are written
            as 2026/27. Supply balances follow the indicative identity of
            opening stocks plus production plus imports, minus domestic use
            and exports, equals estimated closing stocks. The identity is
            not exact: domestic use bundles industrial uses, distillation
            and losses; reference dates differ by country; and figures are
            revised. Residuals against declared stocks are shown, never
            smoothed away.
          </p>
          <p>
            Stock declarations are compared within a country against the
            same reference a year earlier. Cross-country stock comparisons
            are indicative because reference dates and coverage differ; the
            differences are documented on the{" "}
            <Link
              href="/supply/stocks"
              className="text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
            >
              stocks page
            </Link>
            .
          </p>
        </Prose>
      </section>

      <section className="mt-12">
        <SectionHeader kicker="Field reporting" title="Harvest reporting" />
        <Prose>
          <p>
            Harvest coverage is qualitative field reporting made explicit.
            Picking progress is published in 5 percent steps and marked as
            approximate; production forecasts are ranges, not points, until
            declarations narrow them; yield expectations use a four-band
            scale. WineTerm does not add precision the underlying reporting
            does not carry.
          </p>
        </Prose>
      </section>

      <section className="mt-12">
        <SectionHeader kicker="Corrections" title="Revisions policy" />
        <Prose>
          <p>
            When a source revises a figure, WineTerm updates the series,
            marks the observation as revised and keeps the update timestamp
            visible. Desk estimates are replaced, not blended, when
            published figures arrive. Errors of our own are corrected in
            place and noted.
          </p>
        </Prose>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Registry"
          title="Source registry"
          description="Every observation references one entry in this registry. During development all entries are stand-ins; real providers are added as their data is licensed and connected."
        />
        <div className="mt-5 overflow-x-auto border border-rule bg-paper">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              The source registry: name, classification, coverage and cadence
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className={TH}>
                  Source
                </th>
                <th scope="col" className={TH}>
                  Classification
                </th>
                <th scope="col" className={`${TH} hidden md:table-cell`}>
                  Coverage
                </th>
                <th scope="col" className={`${TH} hidden lg:table-cell`}>
                  Cadence
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.values(SOURCE_REGISTRY).map((source) => (
                <tr key={source.id} className="border-b border-rule last:border-b-0">
                  <td className={`${TD} !whitespace-normal text-sm font-medium text-ink`}>
                    {source.name}
                  </td>
                  <td className={TD}>
                    <DataClassificationTag
                      classification={source.classification}
                    />
                  </td>
                  <td
                    className={`${TD} hidden !whitespace-normal text-sm text-ink-soft md:table-cell`}
                  >
                    {source.coverage}
                  </td>
                  <td
                    className={`${TD} hidden !whitespace-normal text-sm text-ink-soft lg:table-cell`}
                  >
                    {source.cadence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader kicker="Status" title="Development status" />
        <Prose>
          <p>
            WineTerm is in development. Every figure currently shown is an
            illustrative sample carrying the Illustrative, Forecast or
            Estimate status, every named source is a stand-in, and nothing
            on the platform is live market data or investment advice. This
            page describes the methodology those samples demonstrate and
            that live data will follow.
          </p>
        </Prose>
      </section>
    </Container>
  );
}
