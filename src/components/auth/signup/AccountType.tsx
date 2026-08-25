"use client";

import { Building2, Briefcase, User, Check, ArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type AccountType = "organization" | "private" | "personal";

const accountOptions = [
  {
    id: "organization" as const,
    title: "Organization",
    description: "For registered companies, enterprises, and multi-user teams.",
    icon: Building2,
  },
  {
    id: "private" as const,
    title: "Private Business",
    description: "For freelancers, sole proprietors, and small business owners.",
    icon: Briefcase,
  },
  {
    id: "personal" as const,
    title: "Personal",
    description: "For individual projects, side hustles, and personal use.",
    icon: User,
  },
];

interface AccountTypeSelectorProps {
  selectedType: AccountType;
  onSelect: (type: AccountType) => void;
  onContinue: () => void;
}

export function AccountTypeSelector({
  selectedType,
  onSelect,
  onContinue,
}: AccountTypeSelectorProps) {
  return (
    <Card className="ring-0 border-none shadow-none px-1 w-full max-w-lg mx-auto bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-2xl font-semibold">
          Choose your account type
        </CardTitle>
        <CardDescription>
          Select how you intend to use the platform.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <RadioGroup
          value={selectedType}
          onValueChange={(val: string) => onSelect(val as AccountType)}
          className="flex flex-col gap-3"
        >
          {accountOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.id;

            return (
              <div key={option.id}>
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="sr-only"
                />
                <Label
                  htmlFor={option.id}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary dark:ring-brand dark:bg-brand/5 dark:border-brand"
                      : "border-border hover:border-muted-foreground/30 bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      isSelected
                        ? "bg-primary text-primary-foreground  dark:bg-brand"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {option.title}
                    </span>
                    <span className="text-xs text-muted-foreground leading-snug">
                      {option.description}
                    </span>
                  </div>

                  <div
                    className={`size-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground dark:bg-brand dark:border-brand"
                        : "border-muted-foreground/30 bg-transparent"
                    }`}
                  >
                    {isSelected && <Check className="size-3 stroke-3" />}
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <Button className="w-full mt-6" size="lg" onClick={onContinue}>
          <ArrowRight className="size-5 inline" />Continue
        </Button>
      </CardContent>
    </Card>
  );
}