"use client";

import { endpoints } from "./endpoints";

import { poster } from "@/lib/axios-server";

// Client-callable server action for contact form submission
export const sendContactForm = async (contactData) => {
    try {
        const response = await poster(endpoints.contactSubmission, contactData);
        return response;
    } catch (error) {
        throw error;
    }
};
