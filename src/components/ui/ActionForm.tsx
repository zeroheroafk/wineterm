"use client";

import { useActionState, type FormHTMLAttributes } from "react";

import type { FormAction, FormState } from "@/lib/actions";

const INITIAL_STATE: FormState = { message: "" };

/**
 * A form bound to a Server Action: fields are posted in the request body
 * and the action's reply is announced under them. The fields themselves
 * stay server-rendered children; only the binding runs on the client.
 */
export function ActionForm({
  action,
  messageClassName = "",
  children,
  ...props
}: Omit<FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: FormAction;
  /** Colour for the reply line, matched to the surface behind the form. */
  messageClassName?: string;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form {...props} action={formAction} aria-busy={pending}>
      {children}
      <p
        aria-live="polite"
        className={`wt-label mt-3 leading-relaxed empty:mt-0 ${messageClassName}`}
      >
        {state.message}
      </p>
    </form>
  );
}
