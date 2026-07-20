import logo from "../../public/e-com-logo.png"

export const appConfig = {
  name: "E-Commerce Platform",
  shortName: "Store",
  description: "A modern, high-performance e-commerce platform.",
  logo: logo,
  links: {
    twitter: "https://twitter.com",
    github: "https://github.com",
    support: "mailto:support@example.com",
  },
  testimonial: {
    quote:
      "This platform has revolutionized our e-commerce business, providing lightning-fast performance and an incredible user experience.",
    author: "Saksham Kamboj",
  },
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
}
