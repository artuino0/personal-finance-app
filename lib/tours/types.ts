import { DriveStep } from "driver.js";

export interface TourStep extends DriveStep {
    element?: string;
    popover?: {
        title: string;
        description: string;
        side?: "top" | "right" | "bottom" | "left";
        align?: "start" | "center" | "end";
    };
}

export type TourConfig = TourStep[];
