export const Category = {
    name: "Category",
    primaryKey: "id",
    properties: {
        id: "int",
        name: "string?",
        order: { type: "int", indexed: true },
    }
};

export const Asset = {
    name: "Asset",
    primaryKey: "id",
    properties: {
        source: "string",
        type: "string",
        id: "string"
    }
};


export const Location = {
    name: "Location",
    primaryKey: "id",
    properties: {
        id: "string",
        name: "string",
        order: { type: "int", indexed: true },
        latitude: "double?",
        longitude: "double?"
    }
};


export const VenueDistance = {
    name: "VenueDistance",
    primaryKey: "id",
    properties: {
        id: "string",
        locationId: { type: "string", indexed: true },
        distance: { type: "int", indexed: true }
    }
};


export const Venue = {
    name: "Venue",
    primaryKey: "id",
    properties: {
        id: "int",
        name: "string",
        address: "string?",
        phone: "string?",
        latitude: "double?",
        longitude: "double?",
        distances: { type: "VenueDistance[]", default: [] }
    }
};


export const EventItem = {
    name: "EventItem",
    primaryKey: "id",
    properties: {
        id: "string",
        eventDate: { type: "date?", indexed: true },
        startTime: "date",
        endTime: "date?",
        allDay: "bool",
        rsvp: { type: "bool", indexed: true, default: false },
        eventSummary: "EventSummary"
    }
};


export const EventSummary = {
    name: "EventSummary",
    primaryKey: "id",
    properties: {
        id: "int",
        updatedAt: "date?",
        name: "string",
        venue: "Venue",

        startTime: "date",
        endTime: "date?",

        ongoing: "bool?",
        allDay: "bool",

        categories: "Category[]",
        featured: "bool",

        multimedia: "Asset[]",

        items: { type: "linkingObjects", objectType: "EventItem", property: "eventSummary" }
    }
};


export const EventDetails = {
    name: "EventDetails",
    primaryKey: "id",
    properties: {
        id: "int",
        description: "string",
        summary: "string",
        moreInfo: "string",
        ticketUrl: "string",
        priceRange: "double[]",
        venue: "Venue"
    }
};


export const TimePeriod = {
    name: "TimePeriod",
    primaryKey: "id",
    properties: {
        id: "string",
        name: "string",
        order: { type: "int", indexed: true },
    }
};


export const UserProfile = {
    name: "UserProfile",
    primaryKey: "id",
    properties: {
        id: "string",
        newUser: "bool",
        location: "Location",
        interests: "Category[]",
        timePeriod: "TimePeriod",
        maxDistance: "int"
    }
};


export default [ Category, Asset, Location, VenueDistance, Venue, EventItem, EventSummary, EventDetails, TimePeriod, UserProfile ];
