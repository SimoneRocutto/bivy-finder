import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ScreenService {
  constructor() {}

  // Todo reference tailwind config breakpoints
  isLargeScreen = () => {
    return window.matchMedia("only screen and (min-width: 1025px)").matches;
  };
}
