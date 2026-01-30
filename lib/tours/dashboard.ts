import { TourConfig } from "./types";

export const getDashboardTour = (t: (key: string) => string): TourConfig => {
    return [
        {
            element: "#tour-welcome-hidden",
            popover: {
                title: t("Tour.Dashboard.welcomeTitle"),
                description: t("Tour.Dashboard.welcomeDesc"),
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-new-transaction",
            popover: {
                title: t("Tour.Dashboard.newTransactionTitle"),
                description: t("Tour.Dashboard.newTransactionDesc"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "#tour-nav-reports",
            popover: {
                title: t("Tour.Dashboard.navReportsTitle"),
                description: t("Tour.Dashboard.navReportsDesc"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "#tour-nav-sharing",
            popover: {
                title: t("Tour.Dashboard.navSharingTitle"),
                description: t("Tour.Dashboard.navSharingDesc"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "#tour-ai-button",
            popover: {
                title: t("Tour.Dashboard.aiTitle"),
                description: t("Tour.Dashboard.aiDesc"),
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-user-menu",
            popover: {
                title: t("Tour.Dashboard.finishTitle"),
                description: t("Tour.Dashboard.finishDesc"),
                side: "left",
                align: "start",
            },
        },
    ];
};
