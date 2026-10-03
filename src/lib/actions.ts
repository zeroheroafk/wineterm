"use server";

import { getSupabase } from "@/lib/supabase";

/**
 * Server Actions behind the site's forms. Fields arrive in the POST body,
 * never in the URL, so addresses and messages stay out of query strings
 * and request logs. Submissions are stored in Supabase as the anon role,
 * which may insert them but never read them back. Without Supabase
 * configured, a submission is validated and discarded, and the reply
 * says so.
 */

export interface FormState {
  /** Reply shown under the form; empty before the first submission. */
  message: string;
}

export type FormAction = (
  previous: FormState,
  formData: FormData,
) => Promise<FormState>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FAILED =
  "Something went wrong on our side and nothing was saved. Please try again in a moment.";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export async function subscribeToBriefing(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = field(formData, "email").toLowerCase();
  if (!isEmail(email)) {
    return { message: "Enter a valid work email address." };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      message:
        "Thank you. Signup processing is not connected in this build, so your address has not been stored.",
    };
  }

  // The database skips addresses already on the list without an error;
  // a unique violation can only come from two simultaneous signups of the
  // same new address, which leaves it on the list all the same.
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });
  if (error && error.code !== "23505") {
    console.error("Briefing signup failed:", error.code, error.message);
    return { message: FAILED };
  }
  return {
    message:
      "Thank you. You are on the list for the Weekly Briefing, which starts at launch.",
  };
}

export async function sendContactMessage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = field(formData, "name");
  const email = field(formData, "email");
  const organisation = field(formData, "organisation");
  const subject = field(formData, "subject") || "Other";
  const message = field(formData, "message");

  if (!name || !message) {
    return { message: "Name, work email and message are required." };
  }
  if (!isEmail(email)) {
    return { message: "Enter a valid work email address." };
  }
  if (
    name.length > 200 ||
    organisation.length > 200 ||
    subject.length > 100 ||
    message.length > 5000
  ) {
    return {
      message:
        "Please keep the message under 5,000 characters and the other fields under 200.",
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      message:
        "Thank you. Message delivery is not connected in this build, so your message has not been sent or stored.",
    };
  }

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    organisation: organisation || null,
    subject,
    message,
  });
  if (error) {
    console.error("Contact message failed:", error.code, error.message);
    return { message: FAILED };
  }
  return { message: "Thank you. Your message has reached the market desk." };
}

export type AlertCondition = "new" | "above" | "below";

const ALERT_CONDITIONS: AlertCondition[] = ["new", "above", "below"];

/**
 * A price alert request from a series page: every new price, or the
 * price crossing a level. Stored for the desk; delivery starts with the
 * briefing's e-mail dispatch. Asking twice for the same alert succeeds
 * silently, so the reply never says whether an address is already on
 * the list.
 */
export async function requestPriceAlert(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = field(formData, "email").toLowerCase();
  const seriesCode = field(formData, "series");
  const condition = field(formData, "condition") as AlertCondition;
  const thresholdText = field(formData, "threshold").replace(",", ".");

  if (!isEmail(email)) {
    return { message: "Enter a valid work email address." };
  }
  if (!/^[A-Z0-9-]{3,40}$/.test(seriesCode) || !ALERT_CONDITIONS.includes(condition)) {
    return { message: "This alert could not be understood. Reload the page and try again." };
  }
  let threshold: number | null = null;
  if (condition !== "new") {
    threshold = Number(thresholdText);
    if (!thresholdText || !Number.isFinite(threshold) || threshold <= 0) {
      return { message: "Enter the price level the alert should watch, in the series unit." };
    }
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      message:
        "Thank you. Alert processing is not connected in this build, so your request has not been stored.",
    };
  }

  const { error } = await supabase.from("price_alerts").insert({
    email,
    series_code: seriesCode,
    condition,
    threshold,
  });
  if (error && error.code !== "23505") {
    console.error("Price alert request failed:", error.code, error.message);
    return { message: FAILED };
  }
  return {
    message:
      condition === "new"
        ? "Thank you. You will hear when this series publishes a new price, starting at launch."
        : `Thank you. You will hear when this series moves ${condition} ${threshold}, starting at launch.`,
  };
}
