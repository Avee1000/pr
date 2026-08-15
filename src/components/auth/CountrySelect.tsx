"use client";

import { useState } from "react";
import { SelectPopover } from "@/components/global/commandSearch";
import { InputWithSelect } from "./CountryCodeSelect";
import { COUNTRIES } from "@/data/countries";
import { Label } from "@/components/ui/label";

// Format options
const countryOptions = COUNTRIES.map((c) => ({
  label: c.country,
  value: c.code,
  phoneCode: c.phone_code,
  currency: c.currency,
  language: c.language,
}));

const COUNTRY_CODES = COUNTRIES.map((c) => ({
  value: c.phone_code,
  label: c.country,
}));

export function CountryAndPhoneForm({ error }: { error?: string }) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [phoneCode, setPhoneCode] = useState("+1");
  const [phone, setPhone] = useState("");

  // 1. DERIVED STATE: Always calculated dynamically from selectedCountryCode
  const selectedCountry = COUNTRIES.find((c) => c.code === selectedCountryCode);
  const locale = selectedCountry ? `${selectedCountry.language}-${selectedCountry.code}` : "";
  const currency = selectedCountry?.currency ?? "";

  // 2. Country -> Phone synchronization
  const handleCountryChange = (countryCodeValue: string) => {
    setSelectedCountryCode(countryCodeValue);

    const foundCountry = COUNTRIES.find((c) => c.code === countryCodeValue);
    if (foundCountry?.phone_code) {
      setPhoneCode(foundCountry.phone_code);
    }
  };

  // 3. Phone -> Country synchronization (locale & currency update automatically!)
  const handlePhoneCodeChange = (newPhoneCode: string) => {
    setPhoneCode(newPhoneCode);

    const foundCountry = COUNTRIES.find((c) => c.phone_code === newPhoneCode);
    if (foundCountry?.code) {
      setSelectedCountryCode(foundCountry.code);
    }
  };

  return (
    <div className="flex flex-row w-full justify-between gap-2 max-sm:flex-col max-sm:gap-6">
      {/* Country Field */}
      <div className="flex flex-col gap-1.5 w-[55%] max-sm:w-full">
        <Label htmlFor="country">Country</Label>
        <SelectPopover
          className={
            error
              ? "border-destructive focus-visible:ring-destructive ring-3 ring-destructive/20 dark:ring-destructive/40 focus-within:ring-destructive/20"
              : " "
          }
          name="country"
          options={countryOptions}
          value={selectedCountryCode}
          onChange={handleCountryChange}
          placeholder="Select a country..."
          searchPlaceholder="Search countries..."
          renderOption={(option) => (
            <div className="flex items-center justify-between gap-2 w-full pr-2">
              <span>{option.label}</span>
              <span className="text-xs text-muted-foreground font-mono">
                {option.phoneCode}
              </span>
            </div>
          )}
        />
        {error && (
          <p id="email-error" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div className="flex flex-col gap-1.5 w-[45%] max-sm:w-full">
        <Label htmlFor="phone">Phone Number</Label>
        <InputWithSelect
          popoverWidth="max-sm:max-w-250"
          prefixName="phonePrefix"
          options={COUNTRY_CODES}
          prefixValue={phoneCode}
          onPrefixChange={handlePhoneCodeChange}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 000-0000"
          searchPlaceholder="Search country or code..."
        />
      </div>

      {/* Hidden inputs pass automatically calculated values on submit */}
      {/* <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="currency" value={currency} /> */}
    </div>
  );
}