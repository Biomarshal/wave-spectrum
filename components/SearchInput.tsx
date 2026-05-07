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
          bg-zinc-900/80
          border border-white/10
          rounded-xl
          text-white
          placeholder-gray-400
          focus:outline-none
          focus:ring-2 focus:ring-purple-500
        "
        style={{ paddingLeft: "42px" }}
      />
    </div>
  );
}
