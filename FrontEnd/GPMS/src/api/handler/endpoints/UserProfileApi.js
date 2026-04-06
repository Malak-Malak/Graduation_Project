import axiosInstance from "./../../axiosInstance";

// ── module-level cache ────────────────────────────────────────────────
let _profileCache = null;
let _profilePromise = null;

const UserProfileApi = {

    /** GET /api/UserProfile — مرة وحدة بس، بعدها من الـ cache */
    getProfile: () => {
        if (_profileCache) return Promise.resolve(_profileCache);
        if (_profilePromise) return _profilePromise;
        _profilePromise = axiosInstance.get("/UserProfile")
            .then((r) => {
                _profileCache = r.data;
                _profilePromise = null;
                return _profileCache;
            })
            .catch((err) => {
                _profilePromise = null;
                throw err;
            });
        return _profilePromise;
    },

    /** يمسح الـ cache — نستدعيه بعد create أو update */
    invalidateCache: () => {
        _profileCache = null;
        _profilePromise = null;
    },

    getProfileById: (userId) =>
        axiosInstance.get(`/UserProfile/${userId}`).then((r) => r.data),

    createProfile: (data) =>
        axiosInstance.post("/UserProfile", {
            phoneNumber: data.phoneNumber ?? "",
            fullName: data.fullName ?? "",
            department: data.department ?? "",
            gitHubLink: data.github ?? "",
            linkedinLink: data.linkedin ?? "",
            field: (data.skills ?? []).join(","),
            personalEmail: data.email ?? "",
            bio: data.bio ?? "",
        }).then((r) => {
            UserProfileApi.invalidateCache();
            return r.data;
        }),

    updateProfile: (data) =>
        axiosInstance.put("/UserProfile", {
            phoneNumber: data.phoneNumber ?? "",
            fullName: data.fullName ?? "",
            department: data.department ?? "",
            gitHubLink: data.github ?? "",
            linkedinLink: data.linkedin ?? "",
            field: (data.skills ?? []).join(","),
            totalNumOfCreditCards: 0,
            personalEmail: data.email ?? "",
            bio: data.bio ?? "",
        }).then((r) => {
            UserProfileApi.invalidateCache();
            return r.data;
        }),
};

export default UserProfileApi;