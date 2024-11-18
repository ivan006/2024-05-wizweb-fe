import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

// Extend Day.js with the required plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);

export default {
    methods: {
        VITE_API_URL() {
            return import.meta.env.VITE_API_URL;
        },
        getHumanReadableDate(theMoment) {
            let value = null;
            const updateMoment = dayjs(theMoment); // Parse the input date
            const currMoment = dayjs(); // Get current time

            const diff = updateMoment.diff(currMoment); // Calculate the difference

            // If within a week, show relative time; otherwise, show full formatted date
            if (diff >= -7 * 24 * 60 * 60 * 1000) {
                // Difference is within the last week
                value = updateMoment.fromNow();
            } else {
                value = updateMoment.format("llll");
            }

            // Capitalize the first letter
            value = value.charAt(0).toUpperCase() + value.slice(1);
            return value;
        },
    },
};
