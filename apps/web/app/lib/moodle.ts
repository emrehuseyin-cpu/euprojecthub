"use server";

const MOODLE_URL = process.env.MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

async function fetchMoodle(wsfunction: string, queryParams: URLSearchParams = new URLSearchParams()) {
    queryParams.append('wstoken', MOODLE_TOKEN || '');
    queryParams.append('wsfunction', wsfunction);
    queryParams.append('moodlewsrestformat', 'json');

    const url = `${MOODLE_URL}/webservice/rest/server.php?${queryParams.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            next: { revalidate: 60 } // Cache results for 60 seconds
        });

        if (!response.ok) {
            throw new Error(`Moodle API connection error: ${response.status}`);
        }

        const data = await response.json();

        if (data.exception) {
            console.warn(`Moodle Exception [${wsfunction}]:`, data.message);
            return []; // Return empty result on function exception instead of crashing the page
        }

        return data;
    } catch (error) {
        console.error(`Failed to fetch from Moodle API [${wsfunction}]:`, error);
        return null;
    }
}

export async function getCourses() {
    const result = await fetchMoodle('core_course_get_courses');
    // Check if result is an array (moodle usually returns an array of course objects here)
    return Array.isArray(result) ? result : [];
}

export async function getCourseEnrollments(courseId: number) {
    const params = new URLSearchParams();
    params.append('courseid', courseId.toString());

    const result = await fetchMoodle('core_enrol_get_enrolled_users', params);
    return Array.isArray(result) ? result : [];
}

export async function getUsers() {
    const params = new URLSearchParams();
    // Usually requires criteria. Trying a generic criteria that matches all emails
    params.append('criteria[0][key]', 'email');
    params.append('criteria[0][value]', '%');

    const result = await fetchMoodle('core_user_get_users', params);
    // core_user_get_users usually returns { users: [...] }
    return result?.users || Array.isArray(result) ? result : [];
}
