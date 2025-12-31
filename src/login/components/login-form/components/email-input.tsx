/**
 * 邮箱输入组件
 */

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export function EmailInput({ value, onChange, hasError }: EmailInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor="email">邮箱</FieldLabel>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="请输入邮箱"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={hasError}
      />
    </Field>
  );
}
