import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export default function InputField({
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  className = "",
  ...props
}: InputFieldProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full
          py-3.5
          pr-4
          bg-zinc-900/80
          border border-white/10
          rounded-xl
          text-white
          placeholder-gray-400
          focus:outline-none
          focus:ring-2 focus:ring-purple-500
          transition
          ${className}
        `}
        style={{
          paddingLeft: icon ? "42px" : "16px",
        }}
        {...props}
      />
    </div>
  );
}
