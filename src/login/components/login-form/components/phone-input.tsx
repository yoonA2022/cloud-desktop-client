/**
 * 手机号输入组件
 */

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export function PhoneInput({ value, onChange, hasError }: PhoneInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor="phone">手机号</FieldLabel>
      <Input
        id="phone"
        name="phone"
        type="tel"
        placeholder="请输入手机号"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={hasError}
      />
    </Field>
  );
}
