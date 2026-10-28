"use client";

import { useActionState, useId, type FormHTMLAttributes } from "react";

import type { FormAction, FormState } from "@/lib/actions";
import { TRAP_FIELD } from "@/lib/forms";

const INITIAL_STATE: FormState = { message: "" };

/**
 * A form bound to a Server Action: fields are posted in the request body
 * and the action's reply is announced under them. The fields themselves
 * stay server-rendered children; only the binding runs on the client.
 * A field no person sees is posted with them: the actions discard a
 * submission that fills it in, which only a bot filling every field does.
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
  const trapId = useId();

  return (
    <form {...props} action={formAction} aria-busy={pending}>
      {children}
      <div
        aria-hidden="true"
        className="absolute left-[-10000px] h-px w-px overflow-hidden"
      >
        <label htmlFor={trapId}>Leave this field empty</label>
        <input
          id={trapId}
          type="text"
          name={TRAP_FIELD}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
      <p
        aria-live="polite"
        className={`wt-label mt-3 leading-relaxed empty:mt-0 ${messageClassName}`}
      >
        {state.message}
      </p>
    </form>
  );
}
