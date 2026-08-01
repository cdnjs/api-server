interface Sponsor {
    name: string;
    service: string;
    url: (context: string) => string;
    message?: string;
}

const sponsors: Sponsor[] = [
    {
        name: 'Cloudflare',
        service: 'Supporting cdnjs with core infrastructure and CDN services.',
        url: (context) =>
            `https://www.cloudflare.com?utm_source=cdnjs&utm_medium=cdnjs_link&utm_campaign=cdnjs_${context}`,
        message:
            'Believing cdnjs is part of the open-source community-driven tools that will build the future of the internet, Cloudflare supports cdnjs by providing the global CDN infrastructure and project maintenance.',
    },
    {
        name: 'Algolia',
        service: 'Supporting cdnjs with search indexing services.',
        url: (context) =>
            `https://www.algolia.com?utm_source=cdnjs&utm_medium=cdnjs_link&utm_campaign=cdnjs_${context}`,
        message:
            "Algolia provides a developer-friendly SaaS API for searching. With Algolia's search indexing and unique find as you type experience, you can find cdnjs libraries in just a few key strokes.",
    },
    {
        name: 'DigitalOcean',
        service: 'Supporting cdnjs with cloud infrastructure services.',
        url: (context) =>
            `https://www.digitalocean.com?utm_source=cdnjs&utm_medium=cdnjs_link&utm_campaign=cdnjs_${context}`,
        message:
            'DigitalOcean is simplifying the cloud by providing an infrastructure experience that developers love. DigitalOcean is proud to give back to open-source and community-driven projects like cdnjs.',
    },
    {
        name: 'Statuspage',
        service: 'Supporting cdnjs with incident communication services.',
        url: (context) =>
            `https://www.atlassian.com/software/statuspage?utm_source=cdnjs&utm_medium=cdnjs_link&utm_campaign=cdnjs_${context}`,
    },
    {
        name: 'Sentry',
        service: 'Supporting cdnjs with error monitoring services.',
        url: (context) =>
            `https://sentry.io?utm_source=cdnjs&utm_medium=cdnjs_link&utm_campaign=cdnjs_${context}`,
    },
    {
        name: 'UptimeRobot',
        service: 'Supporting cdnjs with uptime monitoring services.',
        url: (context) =>
            `https://uptimerobot.com?utm_source=cdnjs&utm_medium=cdnjs_link&utm_campaign=cdnjs_${context}`,
        message:
            "UptimeRobot is the world's leading uptime monitoring service, supporting cdnjs to ensure the service is always available for developers and users around the world.",
    },
];

export default sponsors;
