import { DomUtil, Icon, point } from "leaflet";

// Most of this code has been taken from the npm package Leaflet.Icon.Glyph.
// It was adapted to use it with Angular and Typescript.

export interface GlyphOptions {
  // Akin to the 'className' option in L.DivIcon
  className?: string;
  // CSS class to be used on all glyphs and prefixed to every glyph name
  prefix?: string;
  // Name of the glyph
  glyph?: string;
  // Glyph colour. Value can be any string with a CSS colour definition.
  glyphColor?: string;
  // Size of the glyph, in CSS units
  glyphSize?: string;
  // Position of the center of the glyph relative to the center of the icon. In pixels, counting from the center of the image.
  glyphAnchor?: [number, number];
  // Akin to the 'bgPos' option in L.DivIcon. Use when using a sprite for the icon image.
  bgPos?: [number, number];
  // Forces the size of the background image. Use when using a sprite for the icon image in "retina" mode.
  bgSize?: [number, number];
  // Background marker color.
  markerColor?: "blue" | "red" | "green" | "yellow" | "purple";
}

const Glyph = Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: "",
    prefix: "",
    glyph: "home",
    glyphColor: "white",
    glyphSize: "18px",
    glyphAnchor: [0, -7],
    markerColor: "blue",
    iconUrl: `/assets/leaflet-icon-glyph/glyph-marker-icon-blue.svg`,
    shadowUrl: "leaflet/marker-shadow.png",
  },

  createIcon: function () {
    const div = document.createElement("div");
    const options = this.options;

    if (options.glyph) {
      div.appendChild(this._createGlyph());
    }

    this._setIconStyles(div, options.className);
    return div;
  },

  _createGlyph: function () {
    let glyphClass;
    let textContent;
    const options = this.options;

    if (!options.prefix) {
      glyphClass = "";
      textContent = options.glyph;
    } else if (
      options.prefix === "fab" ||
      options.prefix === "fal" ||
      options.prefix === "far" ||
      options.prefix === "fas"
    ) {
      // Hack for Font Awesome 5 - it needs two different prefixes.
      glyphClass = "fa-" + options.glyph;
    } else if (
      options.glyph.slice(0, options.prefix.length + 1) ===
      options.prefix + "-"
    ) {
      glyphClass = options.glyph;
    } else {
      glyphClass = options.prefix + "-" + options.glyph;
    }

    const span = DomUtil.create("span", options.prefix + " " + glyphClass);
    span.style.fontSize = options.glyphSize;
    span.style.color = options.glyphColor;
    span.style.width = options.iconSize[0] + "px";
    span.style.lineHeight = options.iconSize[1] + "px";
    span.style.textAlign = "center";
    span.style.marginLeft = options.glyphAnchor[0] + "px";
    span.style.marginTop = options.glyphAnchor[1] + "px";
    span.style.pointerEvents = "none";
    span.style.display = "block";

    if (textContent) {
      span.innerHTML = textContent;
    }

    return span;
  },

  _setIconStyles: function (div, name) {
    if (name === "shadow") {
      // Necessary to access private property. Hacky but it's just styling.
      // @ts-ignore
      return Icon.prototype._setIconStyles.call(this, div, name);
    }

    const options = this.options;
    const size = point(options["iconSize"]);
    let anchor = point(options.iconAnchor);

    if (!anchor && size) {
      anchor = size.divideBy(2);
    }

    div.className = "leaflet-marker-icon leaflet-glyph-icon " + name;
    const src = this._getIconUrl("icon");
    if (src) {
      div.style.backgroundImage = "url('" + src + "')";
    }

    if (options.bgPos) {
      div.style.backgroundPosition =
        -options.bgPos.x + "px " + -options.bgPos.y + "px";
    }
    if (options.bgSize) {
      div.style.backgroundSize =
        options.bgSize.x + "px " + options.bgSize.y + "px";
    }

    if (anchor) {
      div.style.marginLeft = -anchor.x + "px";
      div.style.marginTop = -anchor.y + "px";
    }

    if (size) {
      div.style.width = size.x + "px";
      div.style.height = size.y + "px";
    }
  },
});

export const glyph = (options: GlyphOptions) => {
  const { markerColor, ...rest } = options;
  const iconUrl = `/assets/leaflet-icon-glyph/glyph-marker-icon-${markerColor}.svg`;

  return new (Glyph as any)({ ...rest, iconUrl }) as Icon;
};
