import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "formatTime",
  standalone: true,
})
export class FormatTimePipe implements PipeTransform {
  transform(msTime: number, ...args: unknown[]): string {
    const units = [1000 * 60 * 60 * 24, 1000 * 60 * 60, 1000 * 60];
    const values = units.reduce(
      (valuesAndRest: [number[], number], currUnit) => {
        const [values, previousRest] = valuesAndRest;
        const value = Math.floor(previousRest / currUnit);
        const rest = previousRest % currUnit;
        values.push(value);
        valuesAndRest[1] = rest;
        return valuesAndRest;
      },
      [[], msTime]
    )[0];

    return `${values[0] ? values[0] + "d " : ""} ${
      values[1] ? values[1] + "h " : ""
    } ${values[2]}m`;
  }
}
