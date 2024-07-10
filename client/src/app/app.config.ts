import { ApplicationConfig, isDevMode } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideClientHydration } from "@angular/platform-browser";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { TranslocoHttpLoader } from "./transloco-loader";
import { provideTransloco } from "@jsverse/transloco";
import { provideTranslocoPreloadLangs } from "@jsverse/transloco-preload-langs";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(),
    provideTransloco({
      config: {
        availableLangs: ["en", "it"],
        defaultLang: "en",
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    // Change this if language files become huge. For now, we only have 2 languages and they are small.
    // This helps to avoid bugs when defining translations functions inside the ts code and then using
    // them in the html (e.g. admin-dashboard transform function). Without preloading, there would be
    // a brief moment when the translation is not yet loaded, which would mean translations ugly keys
    // would be visibile.
    provideTranslocoPreloadLangs(["en", "it"]),
  ],
};
