import { Pipe, PipeTransform } from "@angular/core";
import { capitalize } from "../helpers/misc";

@Pipe({
  name: "capitalize",
  standalone: true,
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    return capitalize(value);
  }
}
