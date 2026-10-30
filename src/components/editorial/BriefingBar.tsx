"use client";

import { usePathname } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { subscribeToBriefing, type FormState } from "@/lib/actions";
import {
  BAR_DISMISSED_KEY,
  BRIEFING_SUBSCRIBED_KEY,
  barHiddenOn,
  dismissedRecently,
} from "@/lib/briefing-bar";
import { TRAP_FIELD } from "@/lib/forms";

/**
 * The site-wide briefing signup, pinned to the foot of the window: a low
 * paper band under a burgundy rule, one line on a desktop and two compact
 * rows on smaller screens. It shows as soon as a page opens; it steps
 * aside while a signup form of the page's own (`data-briefing-form`,
 * NewsletterSignup) is on screen, which it would only repeat; and it
 * reserves its own height at the foot of the page, so the footer's last
 * line is never left under it. A stored signup retires it for good, the
 * close button for DISMISS_DAYS.
 */

const INITIAL_STATE: FormState = { message: "" };

/** How long the thank-you stays before the bar leaves. */
const THANKS_MS = 2500;

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** Whether the reader has neither closed the bar lately nor signed up. */
function readerIsNew(): boolean {
  try {
    return (
      !dismissedRecently(localStorage.getItem(BAR_DISMISSED_KEY), Date.now()) &&
      !localStorage.getItem(BRIEFING_SUBSCRIBED_KEY)
    );
  } catch {
    // Storage blocked: a close could not be remembered, so never ask.
    return false;
  }
}

/** The server cannot read the reader's storage, so it renders no bar. */
function onServer(): boolean {
  return false;
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked: nothing to remember it in.
  }
}

/** Whether any part of the element is inside the window. */
function onScreen(element: Element): boolean {
  const box = element.getBoundingClientRect();
  if (box.width === 0 && box.height === 0) return false;
  return (
    box.bottom > 0 &&
    box.right > 0 &&
    box.top < window.innerHeight &&
    box.left < window.innerWidth
  );
}

function CloseButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={`size-8 shrink-0 items-center justify-center text-ink-soft transition-colors hover:text-wine-deep ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="size-3 stroke-current"
        strokeWidth={1.5}
      >
        <path d="M1 1l10 10M11 1L1 11" fill="none" />
      </svg>
    </button>
  );
}

export function BriefingBar() {
  const pathname = usePathname();
  const isNew = useSyncExternalStore(subscribeToStorage, readerIsNew, onServer);
  const [closed, setClosed] = useState(false);
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(
    subscribeToBriefing,
    INITIAL_STATE,
  );
  const barRef = useRef<HTMLElement>(null);

  const hiddenHere = closed || barHiddenOn(pathname);

  // Whether a signup form of the page's own is on screen. Until the page
  // has been looked at the answer is yes, so the bar never flashes over a
  // form the page opens with; on a new page the last answer holds for the
  // frame it takes to look again.
  const [formInView, setFormInView] = useState(true);
  useEffect(() => {
    if (!isNew || hiddenHere) return;
    const inView = new Set<Element>();
    let observer: IntersectionObserver | null = null;
    // The new page's content is committed by the next frame.
    const frame = window.requestAnimationFrame(() => {
      const forms = Array.from(document.querySelectorAll("[data-briefing-form]"));
      for (const form of forms) if (onScreen(form)) inView.add(form);
      setFormInView(inView.size > 0);
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target);
          else inView.delete(entry.target);
        }
        setFormInView(inView.size > 0);
      });
      for (const form of forms) observer.observe(form);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [isNew, hiddenHere, pathname]);

  // Once the reader has started on the form, the bar stays until they
  // finish, whatever comes into view.
  const engaged = email !== "" || pending || state.message !== "";
  const showing = !hiddenHere && (engaged || (isNew && !formInView));

  // A stored signup: remember it, thank the reader, then leave.
  useEffect(() => {
    if (!state.ok) return;
    remember(BRIEFING_SUBSCRIBED_KEY, "1");
    const timer = window.setTimeout(() => setClosed(true), THANKS_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  // Reserve the bar's height at the foot of the page, and keep elements
  // reached with the keyboard from scrolling in under it.
  useEffect(() => {
    const bar = barRef.current;
    if (!showing || !bar) return;
    const root = document.documentElement;
    const reserve = () => {
      document.body.style.paddingBottom = `${bar.offsetHeight}px`;
      root.style.scrollPaddingBottom = `${bar.offsetHeight}px`;
    };
    reserve();
    const observer = new ResizeObserver(reserve);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = "";
      root.style.scrollPaddingBottom = "";
    };
  }, [showing]);

  if (!showing) return null;

  const close = () => {
    setClosed(true);
    remember(BAR_DISMISSED_KEY, String(Date.now()));
  };

  return (
    <aside
      ref={barRef}
      aria-labelledby="briefing-bar-title"
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-wine bg-paper"
    >
      <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2.5">
        <div className="flex min-w-0 flex-1 basis-64 items-start justify-between gap-3 lg:flex-none lg:basis-auto">
          <div className="min-w-0">
            <p
              id="briefing-bar-title"
              className="wt-headline text-base leading-tight font-semibold text-ink sm:text-lg"
            >
              The wine market, once a week
            </p>
            <p className="mt-0.5 hidden text-[0.8125rem] leading-snug text-ink-soft sm:block">
              The Weekly Briefing: prices, harvest, supply and trade, every
              Friday.
            </p>
          </div>
          {/* Below lg the close button sits beside the title, out of the
              form's way. */}
          <CloseButton onClick={close} className="-mt-1 -mr-2 flex lg:hidden" />
        </div>

        {state.ok ? null : (
          <form
            action={formAction}
            aria-busy={pending}
            className="flex w-full min-w-0 items-center gap-2 lg:ml-auto lg:w-auto"
          >
            <label htmlFor="briefing-bar-email" className="sr-only">
              Work email
            </label>
            <input
              id="briefing-bar-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-9 min-w-0 flex-1 border border-rule bg-ground px-3 text-[0.9375rem] text-ink placeholder:text-ink-soft/80 lg:w-64 lg:flex-none"
            />
            <Button type="submit" disabled={pending} className="shrink-0">
              Get the briefing
            </Button>
            {/* The field no person sees, as in ActionForm. */}
            <div
              aria-hidden="true"
              className="absolute left-[-10000px] h-px w-px overflow-hidden"
            >
              <label htmlFor="briefing-bar-trap">Leave this field empty</label>
              <input
                id="briefing-bar-trap"
                type="text"
                name={TRAP_FIELD}
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>
          </form>
        )}

        {/* The thank-you takes the form's place; any other reply wraps
            under it. */}
        <p
          aria-live="polite"
          className={`text-[0.8125rem] leading-snug text-wine empty:hidden ${
            state.ok
              ? "w-full font-medium lg:ml-auto lg:w-auto"
              : "order-last w-full lg:text-right"
          }`}
        >
          {state.message}
        </p>

        <CloseButton onClick={close} className="hidden lg:flex" />
      </Container>
    </aside>
  );
}
