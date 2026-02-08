import { forwardRef, type InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name"
> {
  label?: string;
  name: string;
  error?: string;
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, type = "text", name, placeholder, error, icon: Icon, ...rest },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-primary-300 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
              <Icon size={20} />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            className={`w-full ${Icon ? "pl-12" : "pl-4"} pr-4 py-3 bg-dark border ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
            } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
            {...rest}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
