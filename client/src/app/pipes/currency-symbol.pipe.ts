import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "currencySymbol",
  standalone: true,
})
export class CurrencySymbolPipe implements PipeTransform {
  transform(value?: string, ...args: unknown[]): unknown {
    const currencies = {
      USD: "$",
      EUR: "€",
    };
    return currencies?.[value ?? ""] ?? "€";
  }
}
