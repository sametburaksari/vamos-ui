"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { IconButton, Input, useLabels, type InputProps } from "@vamos-ui/react";

const passwordLabels = { showPassword: "Show password", hidePassword: "Hide password" };

export interface PasswordInputProps extends Omit<InputProps, "type" | "trailing" | "labels"> {
  /** Built-in strings: show / hide toggle (`input` namespace). */
  labels?: Partial<typeof passwordLabels>;
}

/** Kit Input with a show / hide toggle. Reads the surrounding Field like any kit control. */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput({ labels, ...props }, ref) {
  const t = useLabels("input", passwordLabels, labels);
  const [visible, setVisible] = React.useState(false);
  return (
    <Input
      ref={ref}
      {...props}
      type={visible ? "text" : "password"}
      spellCheck={false}
      trailing={
        <IconButton
          size="xs"
          variant="ghost"
          tooltip={false}
          label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
          disabled={props.disabled}
          onClick={() => setVisible((v) => !v)}
          className="pointer-events-auto text-fg-muted"
        >
          {visible ? <EyeOff /> : <Eye />}
        </IconButton>
      }
    />
  );
});
