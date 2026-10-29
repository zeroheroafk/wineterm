import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import {
  DataClassificationTag,
  SourceTypeTag,
  VerificationTag,
} from "@/components/markets/tags";
import { TD, TH } from "@/components/markets/cells";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
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
  alternates: { canonical: "/insights/methodology" },
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
    "WineTerm estimates where no published price exists: computed from official figures by a stated method, or built from scattered observations. Clearly labelled, and replaced when published prices arrive.",
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
    "A WineTerm estimate where no published series exists, with its method stated on the series page.",
};

const STATUS_NOTES: Record<DataStatus, string> = {
  final: "The source has closed the figure; only formal corrections follow.",
  provisional: "Published by the source but still subject to routine revision.",
  estimate:
    "A quantified assessment rather than a published figure: a WineTerm estimate, or a figure ahead of its publication by the source.",
  forecast: "Forward-looking, expressed as a range wherever possible.",
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
        section={primaryNavigation[6]}
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
            WineTerm publishes price series for bulk wine, with must prices
            to follow as sources allow; the stocks each country declares;
            Spain&apos;s declared supply balance of stocks, production,
            entries and exits; the official harvest estimates; customs
            trade aggregates; and, for the consumer, the value of a bottle
            at the border and the consumer prices of wine. Coverage spans
            Spain, Portugal, France and Italy, and the consumer prices the
            EU, Switzerland and the United States. A section without a
            source yet says so rather than showing a stand-in.
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
          description="Observations keep the unit their source publishes, apart from prices per hectolitre-degree. Nothing is converted silently."
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
          <p>
            Bulk wine and must are often quoted per hectolitre-degree: euros
            per hectolitre for each percent of alcohol by volume. Those
            prices are shown in EUR/hl, so that every bulk price reads in one
            unit: the price per degree multiplied by the wine&apos;s strength,
            or the must&apos;s potential strength. The strength is the one
            the product states, or the midpoint of a stated range. Each
            series page gives the value as recorded and the strength used.
          </p>
        </Prose>
        <ScrollRegion className="mt-5 max-w-xl border border-rule bg-paper">
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
        </ScrollRegion>
      </section>

      <section id="bulk-prices" className="mt-12 scroll-mt-6">
        <SectionHeader
          kicker="Bulk wine"
          title="How each country's bulk price is established"
          description="The price tables show one national bulk wine price per country, and regional prices where a source publishes them, without a status tag. This is where each one comes from."
        />
        <ul className="mt-5 max-w-3xl divide-y divide-rule border-y border-rule">
          <li className="grid grid-cols-1 gap-x-6 gap-y-1.5 py-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <span className="text-sm font-medium text-ink">Spain</span>
            <span className="text-sm leading-relaxed text-ink-soft">
              Official. The Spanish Ministry of Agriculture&apos;s weekly
              national average ex-winery prices of white and of red wine
              without PDO/PGI (Precios Medios Nacionales), and the same
              prices in its representative markets (Albacete, Ciudad Real,
              Cuenca and Toledo in Castilla-La Mancha, Badajoz, Murcia and
              Valencia), as Spain notifies them to the European Commission,
              both imported unchanged.
            </span>
          </li>
          <li className="grid grid-cols-1 gap-x-6 gap-y-1.5 py-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <span className="text-sm font-medium text-ink">
              Portugal, France and Italy
            </span>
            <span className="text-sm leading-relaxed text-ink-soft">
              WineTerm estimates, monthly, for the national price. No current
              national bulk wine price is yet available that WineTerm may
              republish, so the price is the average of the bulk wine the
              country exports, computed from Eurostat&apos;s trade figures, as
              set out below.
            </span>
          </li>
          <li className="grid grid-cols-1 gap-x-6 gap-y-1.5 py-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <span className="text-sm font-medium text-ink">
              France, by region
            </span>
            <span className="text-sm leading-relaxed text-ink-soft">
              Official. The monthly average prices of the bulk purchase
              contracts presented for visa to FranceAgriMer and the
              interprofessions, for wine without GI and PGI wine by colour,
              in Languedoc-Roussillon and Midi-Pyrénées, as the Ministry of
              Agriculture&apos;s regional office in Occitanie (DRAAF Occitanie)
              publishes them, imported unchanged. They are averages over
              every contract of the month, so a month with few contracts
              moves more than the market.
            </span>
          </li>
        </ul>
        <Prose>
          <p>
            For Portugal, France and Italy, WineTerm divides the value of a
            month&apos;s exports of wine in containers over 10 litres (CN 2204
            29) by their volume in litres, per hectolitre: the average price
            of the country&apos;s own wine sold in bulk. Imports are left out,
            since they are mostly Spanish wine and say little about the
            country&apos;s own prices.
          </p>
          <p>
            It is an average, not a quoted price. It covers every colour,
            category and destination, valued at the border, so it moves with
            the mix of wines sold as well as with prices, and a month with
            little trade moves more than the market. French and Italian bulk
            exports carry much wine with a PDO or PGI, so their averages sit
            above the price of wine without GI. As a check, the same average
            for Spain has followed MAPA&apos;s official national price closely
            since 2021, at 6 to 17% above it.
          </p>
          <p>
            Each month is dated to its last day and arrives about two months
            later, when Eurostat publishes it; Eurostat revises recent months,
            and WineTerm applies its revisions and marks the months they
            change as revised. An estimate gives way to an official or
            reported price once one can be published.
          </p>
        </Prose>
      </section>

      <section id="consumer" className="mt-12 scroll-mt-6">
        <SectionHeader
          kicker="Consumer"
          title="Bottle prices and shop prices"
          description="The Consumer pages follow wine from the border to the shelf: what a bottle is worth when it leaves its country, and how the price of wine in the shops moves."
        />
        <Prose>
          <p>
            A bottle&apos;s price at the border is a WineTerm calculation from
            Eurostat&apos;s trade figures: the statistical value of a
            country&apos;s exports divided by their volume in litres, times
            0.75, the value of a 75 cl bottle. Still wine is the customs
            subheading for containers of up to 2 litres (CN 2204 21), mostly
            75 cl bottles with litre bottles, magnums and cartons among them;
            sparkling wine has its own (CN 2204 10). Like the bulk estimates,
            it is an average over every colour, category and price point a
            country sells, valued at its border, and it moves with the mix of
            wines as well as with prices. It is not a shelf price: freight,
            duties and excise, the trade&apos;s margins and VAT come after it.
          </p>
          <p>
            Shop prices are official statistics, imported unchanged.
            Eurostat&apos;s harmonised index of consumer prices of wine from
            grapes follows the prices households pay for wine to take home,
            taxes included, in the same way in every EU country and
            Switzerland, with 2025 as the reference year; wine served in
            restaurants and bars is priced with catering and is not covered.
            The change on a year earlier is Eurostat&apos;s, and the change
            over five years is computed from the indices. An index compares
            a country with itself, never with another country. For the United
            States, the Bureau of Labor Statistics publishes the average price
            of a litre of table wine in US cities; WineTerm shows it per 75 cl
            bottle and compares it with the same month a year earlier.
          </p>
        </Prose>
      </section>

      <section id="supply-balance" className="mt-12 scroll-mt-6">
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
            smoothed away. Spain&apos;s balance instead adds up the monthly
            declarations to the Ministry of Agriculture, and shows what they
            leave unaccounted.
          </p>
          <p>
            Stocks are shown as each country declares them: Spain&apos;s and
            Italy&apos;s at the end of each month, from the INFOVI
            declarations and the telematic wine register; France&apos;s and
            Portugal&apos;s at 31 July, from the declarations to customs and
            to the wine institute. Each is compared against itself a year
            earlier. Cross-country comparisons are indicative because who
            declares and what is counted differ.
          </p>
        </Prose>
      </section>

      <section className="mt-12">
        <SectionHeader kicker="Harvest" title="Harvest estimates" />
        <Prose>
          <p>
            Harvest coverage is each country&apos;s official production
            estimate, entered by hand from each release with its date:
            Agreste&apos;s monthly estimates for France, the IVV&apos;s
            forecast for Portugal, MAPA&apos;s crop estimates for Spain and
            the trade associations&apos; report for Italy. Before the harvest
            the figures are forecasts; from the first estimate after picking
            starts they are provisional figures of the crop that is in,
            revised until the declarations close. Each source counts its own
            scope, which is stated next to the figure; ranges are kept as
            ranges, and WineTerm adds no precision the sources do not carry.
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
          description="Every observation references one entry in this registry: the official statistics WineTerm imports, the bodies whose harvest estimates it enters by hand, and its own estimates computed from them. Providers are added as their data is licensed and connected."
        />
        <ScrollRegion className="mt-5 border border-rule bg-paper">
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
        </ScrollRegion>
      </section>

      <section className="mt-12">
        <SectionHeader kicker="Status" title="Development status" />
        <Prose>
          <p>
            WineTerm is in development, and every figure it shows is read
            from a named source or computed from one by a stated method.
            Trade figures credited to Eurostat Comext are official
            statistics, refreshed every month. Spain&apos;s national and
            regional bulk wine prices and its monthly declarations of wine
            stocks, production, entries and exits credited to MAPA are
            official statistics, refreshed every week, as are the regional
            bulk prices credited to DRAAF Occitanie. Italy&apos;s monthly
            stocks credited to the ICQRF, and the stocks France and Portugal
            declare at 31 July, credited to the customs and to the IVV, are
            official statistics imported from each release. The harvest
            estimates credited to Agreste, the IVV and MAPA are official
            too, entered by hand from each release. The bulk wine prices for
            Portugal, France and Italy are WineTerm&apos;s monthly estimates
            from the Eurostat trade figures, described above, and so are the
            bottle prices at the border. The consumer prices credited to
            Eurostat and to the US Bureau of Labor Statistics are official
            statistics, checked for new months every week. Must prices
            and the supply balances of Portugal, France and Italy wait for
            sources WineTerm may republish, and their pages say so; grape
            prices are not covered. Nothing on the platform is investment
            advice.
          </p>
        </Prose>
      </section>
    </Container>
  );
}
