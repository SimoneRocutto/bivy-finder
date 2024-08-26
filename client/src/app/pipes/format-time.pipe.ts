import { Pipe, PipeTransform } from "@angular/core";
import { msToHuman } from "../helpers/misc";

@Pipe({
  name: "formatTime",
  standalone: true,
})
export class FormatTimePipe implements PipeTransform {
  transform(msTime: number, ...args: unknown[]): string {
    const values = msToHuman(msTime);

    return `${values[0] ? values[0] + "d " : ""} ${
      values[1] ? values[1] + "h " : ""
    } ${values[2]}m`;
  }
}
