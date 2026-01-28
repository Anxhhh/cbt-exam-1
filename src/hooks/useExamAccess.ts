import { useUser, useAuth } from "@clerk/clerk-react";

export const useExamAccess = () => {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { isLoaded: isAuthLoaded } = useAuth();

    const isLoaded = isUserLoaded && isAuthLoaded;

    const role = user?.publicMetadata?.role;
    const canAccessPremium = role === 'premium';

    return {
        isLoaded,
        canAccessPremium,
        user
    };
};
