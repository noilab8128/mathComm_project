
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const isAuth = !!req.nextauth.token;
        const url = req.nextUrl.clone();

        // Root is landing, it's public. Dashboard requires auth.
        const isLogin = url.pathname === "/login";

        // Auth user trying to access login -> redirect to dashboard
        if (isAuth && isLogin) {
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }

        // Protect admin routes
        const isAdminRoute = url.pathname.startsWith("/admin");
        if (isAdminRoute) {
            const userRole = req.nextauth.token?.role;
            if (userRole !== "admin") {
                url.pathname = "/dashboard";
                return NextResponse.redirect(url);
            }
        }

        // Onboarding checks
        const isOnboardingRoute = url.pathname.startsWith("/onboarding");
        
        if (isAuth) {
            const isOnboarded = req.nextauth.token?.is_onboarded === true;
            
            // If authenticated but not onboarded, strictly force to /onboarding
            // Escape hatch: Allow requests to /api/ (for saving data)
            if (!isOnboarded && !isOnboardingRoute && !url.pathname.startsWith('/api/')) {
                url.pathname = "/onboarding";
                return NextResponse.redirect(url);
            }

            // If already onboarded and trying to access onboarding, redirect to dashboard
            if (isOnboarded && isOnboardingRoute) {
                url.pathname = "/dashboard";
                return NextResponse.redirect(url);
            }
        }
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const url = req.nextUrl.clone();

                const isPublicRoute = url.pathname === "/" || url.pathname === "/login" || url.pathname === "/top-secret";

                // Return true if authenticated or if accessing public pages
                return !!token || isPublicRoute;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico and other metadata files
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)).*)",
    ],
};
