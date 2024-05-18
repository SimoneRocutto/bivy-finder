import { Component } from "@angular/core";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import {
  Icon,
  LatLngExpression,
  LayerGroup,
  // Don't want conflicts with the vanilla JS Map type
  Map as LMap,
  MapOptions,
  Marker,
  control,
  icon,
  latLng,
  tileLayer,
} from "leaflet";

@Component({
  selector: "app-bivouacs-map",
  standalone: true,
  imports: [LeafletModule],
  template: `
    <div
      style="height: 600px; width: 100vw"
      class="z-0"
      leaflet
      [leafletOptions]="options"
      (leafletMapReady)="onMapReady($event)"
    ></div>
  `,
})
export class BivouacsMapComponent {
  map?: LMap;

  bivouacs: {
    name: string;
    description: string;
    imageUrl: string;
    color: string;
    latLng: LatLngExpression;
  }[] = [
    {
      name: "Alpe di Lierna",
      description: "https://www.diska.it/rifalpedilierna.asp",
      imageUrl:
        "https://lh3.googleusercontent.com/umsh/AN6v0v6tHeLlwqJMh7Z3OUnef7QU8qEVpfwI3giHOBDomaKxWDfnxJB30CYnc-kQ3D-RVmTY20jnRs9usFLhVNqYOAxUjL0gg0ECIgYL5Cqpv7K_l4-xmg",
      color: "#icon-959-F8971B-labelson",
      latLng: [45.967, 9.33355555555556, 0],
    },
    {
      name: "Ca' dell'Alpe",
      description: "https://www.diska.it/rifcadellalpe.asp",
      imageUrl:
        "https://lh3.googleusercontent.com/umsh/AN6v0v6vCagg5rOHRgLP-N3sQ0v1e6iBaswEDlY19Ce3k_MZpvUMzC6Bg3UDq4HFBeCyz_6c4OUNFa2etI8ltHZUbeTQsasVB_zjAt7avzn9yP-5vBM",
      color: "#icon-959-4186F0-labelson",
      latLng: [45.9718611111111, 9.33055555555552, 0],
    },
  ];

  markerIcon: Icon = icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: "leaflet/marker-icon.png",
    shadowUrl: "leaflet/marker-shadow.png",
  });

  markersLayer: LayerGroup = new LayerGroup();

  options: MapOptions = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "...",
      }),
      this.markersLayer,
    ],
    zoom: 8,
    zoomControl: false,
    center: latLng(45.47606840909091, 9.146797684437137),
  };

  onMapReady = (map: LMap) => {
    this.map = map;
    control.zoom({ position: "bottomright" }).addTo(this.map);
    for (const bivouac of this.bivouacs) {
      new Marker(bivouac.latLng, { icon: this.markerIcon })
        .bindPopup(`${bivouac.name}<br><img src='${bivouac.imageUrl}'>`)
        .addTo(this.markersLayer);
    }
  };
}
