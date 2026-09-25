"use server";

/**
 * Server Actions behind the site's forms. Fields arrive in the POST body,
 * never in the URL, so addresses and messages stay out of query strings
 * and request logs. Subscription storage and message delivery arrive with
 * the backend phase; until then a submission is validated and discarded,
 * never stored or forwarded, as the privacy page states.
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

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function subscribeToBriefing(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!EMAIL_PATTERN.test(field(formData, "email"))) {
    return { message: "Enter a valid work email address." };
  }
  return {
    message:
      "Thank you. Signup processing is not connected yet in this development build, so your address has not been stored.",
  };
}

export async function sendContactMessage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!field(formData, "name") || !field(formData, "message")) {
    return { message: "Name, work email and message are required." };
  }
  if (!EMAIL_PATTERN.test(field(formData, "email"))) {
    return { message: "Enter a valid work email address." };
  }
  return {
    message:
      "Thank you. Message delivery is not connected yet in this development build, so your message has not been sent or stored.",
  };
}
