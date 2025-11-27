import { useCallback } from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function Switch({
  checked,
  onChange,
  disabled = false,
  className = "",
}: SwitchProps) {
  const toggle = useCallback(() => {
    if (!disabled) onChange(!checked);
  }, [checked, disabled, onChange]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      disabled={disabled}
      className={[
        "relative ml-2 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-blue-500" : "bg-gray-700",
        disabled && "cursor-not-allowed opacity-50",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
