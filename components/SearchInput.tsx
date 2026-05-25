import { Search } from "lucide-react";

interface Props {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchInput({ value, onChange }: Props) {
  return (
    <div className="relative w-full">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />

      <input
        type="text"
        placeholder="Search tracks..."
        value={value}
        onChange={onChange}
        className="
          w-full
          py-3
          pr-4
          bg-[var(--color-bg-hover)]
          border border-[var(--color-border)]
          rounded-xl
          text-[var(--color-text-primary)]
          placeholder-[var(--color-text-muted)]
          focus:outline-none
          focus:ring-2 focus:ring-purple-500
          theme-transition
        "
        style={{ paddingLeft: "42px" }}
      />
    </div>
  );
}
