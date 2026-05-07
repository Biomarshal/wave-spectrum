import { Headphones } from "lucide-react";

export default function AppLogo({ size = 28 }) {
  return (
    <div
      className="
        flex items-center justify-center
        rounded-xl
        bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500
        shadow-lg shadow-purple-500/30
        shrink-0
      "
      style={{
        width: size + 16,
        height: size + 16,
      }}
    >
      <Headphones
        size={size}
        className="text-white"
        strokeWidth={2.2}
      />
    </div>
  );
}
