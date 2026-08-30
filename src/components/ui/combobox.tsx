import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ComboboxOption = string | { value: string; label: string };

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  id?: string;
  name?: string;
  allowCustom?: boolean;
}

function optionValue(o: ComboboxOption) {
  return typeof o === "string" ? o : o.value;
}
function optionLabel(o: ComboboxOption) {
  return typeof o === "string" ? o : o.label;
}

/** Champ de saisie avec autocomplétion (ex. ville, ou sélection dans une longue liste). */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Sélectionner…",
  searchPlaceholder = "Rechercher…",
  emptyLabel = "Aucun résultat.",
  id,
  name,
  allowCustom = true,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedLabel = options.find((o) => optionValue(o) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {selectedLabel ? optionLabel(selectedLabel) : value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={!allowCustom}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {allowCustom && query.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange(query.trim());
                    setOpen(false);
                  }}
                  className="w-full px-2 py-1.5 text-left text-sm hover:text-foreground"
                >
                  Utiliser « {query.trim()} »
                </button>
              ) : (
                emptyLabel
              )}
            </CommandEmpty>
            <CommandGroup>
              {(allowCustom
                ? options.filter((o) =>
                    optionLabel(o).toLowerCase().includes(query.toLowerCase()),
                  )
                : options
              ).map((option) => {
                const v = optionValue(option);
                const l = optionLabel(option);
                return (
                  <CommandItem
                    key={v}
                    value={l}
                    onSelect={() => {
                      onChange(v === value ? "" : v);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 size-4", value === v ? "opacity-100" : "opacity-0")} />
                    {l}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
