import type React from "react";

// <tableau-viz> is a web component from the Tableau Embedding API v3.
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "tableau-viz": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src: string;
        toolbar?: "top" | "bottom" | "hidden";
        "hide-tabs"?: boolean;
        device?: "default" | "desktop" | "tablet" | "phone";
        width?: string;
        height?: string;
      };
    }
  }
}
