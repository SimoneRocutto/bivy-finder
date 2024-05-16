import { Component } from "@angular/core";
// import { LeafletModule } from "@asymmetrik/ngx-leaflet";
// import { latLng, tileLayer } from "leaflet";

@Component({
  selector: "app-bivouacs-map",
  standalone: true,
  // imports: [LeafletModule],
  template: `
    <p>bivouacs-map works!</p>
    <!-- <div style="height: 300px;" leaflet [leafletOptions]="options"></div> -->
  `,
})
export class BivouacsMapComponent {
  // options = {
  //   layers: [
  //     tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //       maxZoom: 18,
  //       attribution: "...",
  //     }),
  //   ],
  //   zoom: 5,
  //   center: latLng(46.879966, -121.726909),
  // };
}
