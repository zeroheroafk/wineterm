import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { requestPriceAlert } from "@/lib/actions";
import { formatPrice } from "@/lib/format";
import type { MarketSeries } from "@/services/markets/types";

const FIELD =
  "mt-1.5 h-9 w-full border border-rule bg-ground px-3 font-mono text-sm text-ink placeholder:text-ink-soft";

/**
 * Price alert request on a series page: an e-mail address, what to
 * watch for (every new price, or the price crossing a level) and the
 * level, in the series unit. The series code travels as a hidden field;
 * the Server Action validates everything again.
 */
export function PriceAlertForm({
  series,
  latestValue,
}: {
  series: MarketSeries;
  latestValue: number;
}) {
  const id = `alert-${series.code.toLowerCase()}`;
  return (
    <ActionForm
      action={requestPriceAlert}
      aria-labelledby={`${id}-title`}
      className="border border-rule bg-paper px-4 py-4"
      messageClassName="text-wine"
    >
      <input type="hidden" name="series" value={series.code} />
      <h2 id={`${id}-title`} className="wt-label text-wine">
        Price alert
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        Hear when this series publishes a new price, or crosses a level you
        set. Alerts start with the Weekly Briefing&apos;s e-mail delivery.
      </p>
      <div className="mt-3">
        <label htmlFor={`${id}-email`} className="wt-label text-ink-soft">
          Work email
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="name@company.com"
          className={FIELD}
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
        <div>
          <label htmlFor={`${id}-condition`} className="wt-label text-ink-soft">
            Tell me when
          </label>
          <select id={`${id}-condition`} name="condition" className={FIELD}>
            <option value="new">A new price is published</option>
            <option value="above">The price rises above</option>
            <option value="below">The price falls below</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-threshold`} className="wt-label text-ink-soft">
            Level, {series.unit}
          </label>
          <input
            id={`${id}-threshold`}
            name="threshold"
            type="text"
            inputMode="decimal"
            placeholder={formatPrice(latestValue)}
            className={FIELD}
          />
        </div>
      </div>
      <div className="mt-3">
        <Button type="submit" variant="secondary">
          Request alert
        </Button>
      </div>
    </ActionForm>
  );
}
