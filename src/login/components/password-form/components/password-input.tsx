/**
 * 密码输入组件
 * 支持点击眼睛图标切换密码可见性
 */

import { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  hasError,
  autoFocus,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field>
      <FieldLabel htmlFor="password">密码</FieldLabel>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="请输入密码"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={hasError}
          autoFocus={autoFocus}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <IoEyeOff className="size-4 text-muted-foreground" />
          ) : (
            <IoEye className="size-4 text-muted-foreground" />
          )}
          <span className="sr-only">
            {showPassword ? "隐藏密码" : "显示密码"}
          </span>
        </Button>
      </div>
    </Field>
  );
}
