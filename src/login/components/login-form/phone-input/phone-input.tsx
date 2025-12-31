/**
 * 手机号输入组件
 * 支持国际区号选择和搜索功能
 */

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { getPhoneCodes } from "@/services/phone";
import type { PhoneCode } from "@/types/phone";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  phoneCode: string;
  onPhoneCodeChange: (value: string) => void;
  hasError?: boolean;
}

/**
 * 从 link 字段解析国家名称
 * 例如: "+86(中国)" -> "中国"
 */
function parseCountryName(link: string): string {
  const match = link.match(/\(([^)]+)\)/);
  return match ? match[1] : link;
}

export function PhoneInput({
  value,
  onChange,
  phoneCode,
  onPhoneCodeChange,
  hasError,
}: PhoneInputProps) {
  const [phoneCodes, setPhoneCodes] = useState<PhoneCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // 使用 ref 存储回调函数，避免 useEffect 依赖问题
  const onPhoneCodeChangeRef = useRef(onPhoneCodeChange);
  onPhoneCodeChangeRef.current = onPhoneCodeChange;

  useEffect(() => {
    async function fetchPhoneCodes() {
      try {
        const response = await getPhoneCodes();
        if (response.status === 200 && response.data) {
          setPhoneCodes(response.data);
          // 默认选择中国区号 +86（精确匹配）
          if (!phoneCode) {
            const chinaCode = response.data.find(
              (item) => item.phone_code === "+86" && item.link === "+86(中国)"
            );
            if (chinaCode) {
              onPhoneCodeChangeRef.current(chinaCode.phone_code);
            } else if (response.data.length > 0) {
              onPhoneCodeChangeRef.current(response.data[0].phone_code);
            }
          }
        }
      } catch {
        console.error("获取手机区号失败");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPhoneCodes();
  }, [phoneCode]);

  // 获取当前选中的区号信息
  const selectedPhoneCode = phoneCodes.find(
    (item) => item.phone_code === phoneCode
  );

  // 生成显示文本
  const displayText = selectedPhoneCode
    ? `${selectedPhoneCode.phone_code} ${parseCountryName(selectedPhoneCode.link)}`
    : "选择区号";

  return (
    <Field>
      <FieldLabel htmlFor="phone">手机号</FieldLabel>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              disabled={isLoading}
              className={cn(
                "flex h-9 w-36 shrink-0 items-center justify-between rounded-md border bg-background px-3 py-2 text-sm shadow-xs",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
              )}
            >
              {isLoading ? (
                <Spinner className="size-4" />
              ) : (
                <span className="truncate">{displayText}</span>
              )}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command className="rounded-lg">
              <CommandInput placeholder="搜索国家或区号..." className="h-10" />
              <CommandList className="max-h-60 custom-scrollbar">
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  未找到匹配的国家或区号
                </CommandEmpty>
                <CommandGroup className="p-1.5">
                  {phoneCodes.map((item, index) => {
                    const countryName = parseCountryName(item.link);
                    const isSelected = phoneCode === item.phone_code;
                    return (
                      <CommandItem
                        key={`${item.phone_code}-${index}`}
                        value={`${item.phone_code} ${countryName}`}
                        onSelect={() => {
                          onPhoneCodeChange(item.phone_code);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer",
                          "transition-colors duration-150",
                          isSelected && "bg-accent"
                        )}
                      >
                        <span className="flex items-center justify-center w-14 shrink-0 font-mono text-sm font-semibold text-primary">
                          {item.phone_code}
                        </span>
                        <span className="flex-1 truncate text-sm">
                          {countryName}
                        </span>
                        <Check
                          className={cn(
                            "size-4 shrink-0 text-primary transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="请输入手机号"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={hasError}
          className="flex-1"
        />
      </div>
    </Field>
  );
}
