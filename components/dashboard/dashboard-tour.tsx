"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslations } from "next-intl";
import { getDashboardTour } from "@/lib/tours/dashboard";

interface DashboardTourProps {
    tourId: "dashboard"; // Extensible for other tours
}

export function DashboardTour({ tourId }: DashboardTourProps) {
    const t = useTranslations();
    const driverObj = useRef<any>(null);

    useEffect(() => {
        // Check if user has seen this specific tour
        const hasSeenTour = localStorage.getItem(`has_seen_tour_${tourId}`);

        if (hasSeenTour) {
            return;
        }

        // Give the UI a moment to fully mount/hydrate
        const timer = setTimeout(() => {
            let steps: any[] = [];

            // Select tour configuration based on ID
            switch (tourId) {
                case "dashboard":
                    steps = getDashboardTour((key) => t(key));
                    break;
                default:
                    return;
            }

            driverObj.current = driver({
                showProgress: true,
                animate: true,
                steps: steps,
                onDestroyed: () => {
                    // Mark as seen when tour is closed/finished
                    localStorage.setItem(`has_seen_tour_${tourId}`, "true");
                }
            });

            driverObj.current.drive();
        }, 1500); // Small delay to ensure elements are rendered

        return () => clearTimeout(timer);
    }, [tourId, t]);

    return null; // This component does not render visual UI itself
}
