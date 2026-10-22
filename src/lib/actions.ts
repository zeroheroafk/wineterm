"use server";

import { TRAP_FIELD } from "@/lib/forms";
import { getSupabase } from "@/lib/supabase";

/**
 * Server Actions behind the site's forms. Fields arrive in the POST body,
 * never in the URL, so addresses and messages stay out of query strings
 * and request logs. Submissions are stored in Supabase as the anon role,
 * which may insert them but never read them back. Without Supabase
 * configured, a submission is validated and discarded, and the reply
 * says so. A submission that fills the field no person sees is a bot's:
 * it is discarded with the reply an accepted one gets.
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
const SUBSCRIBED = "Thank you. You are on the list for the Weekly Briefing.";
const SENT = "Thank you. Your message has reached the market desk.";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

/** True for a submission that filled the field no person sees. */
function isTrapped(formData: FormData): boolean {
  return field(formData, TRAP_FIELD) !== "";
}

export async function subscribeToBriefing(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = field(formData, "email").toLowerCase();
  if (!isEmail(email)) {
    return { message: "Enter a valid work email address." };
  }

  if (isTrapped(formData)) return { message: SUBSCRIBED };

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
  return { message: SUBSCRIBED };
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

  if (isTrapped(formData)) return { message: SENT };

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
  return { message: SENT };
}
