"use client"

import { useEffect, useState } from "react"

export function useIsIOS() {
    const [isIOS, setIsIOS] = useState(false)

    useEffect(() => {
        // Check if running on iOS
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)

        // Also check for iPad on iOS 13+ which identifies as Mac
        const isIPadOS = /macintosh/.test(userAgent) && 'ontouchend' in document

        setIsIOS(isIOSDevice || isIPadOS)
    }, [])

    return isIOS
}
