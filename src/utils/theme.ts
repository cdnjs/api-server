const breakpoint = (value: number) =>
    `@media screen and (max-width: ${value * 8}px)`;

export default {
    text: {
        primary: '#ebebeb',
    },
    background: {
        body: '#454647',
    },
    spacing: (value: number) => `${value * 8}px`,
    breakpoints: {
        medium: breakpoint(96),
    },
    font: {
        body: {
            size: '1rem',
            weight: 400,
        },
    },
};
