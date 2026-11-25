// Portfolio facts are kept together here so the content can be updated without
// changing the visual experience.
export const portfolio = {
  name: "Pathan Jabeen",
  shortName: "Jabeen",
  role: "Pharmacy Student",
  tagline:
    "B.Pharm student interested in pharmaceutical analysis, formulation, and practical healthcare innovation.",
  summary:
    "Bachelor of Pharmacy student at Shri Vishnu College of Pharmacy, with hands-on project experience in mouthwash formulation and green-solvent analysis of ibuprofen.",
  location: "Bhimavaram, Andhra Pradesh, India",
  resume: "/media/Pathan-Jabeen-Resume.pdf",
  contact: {
    email: "jabeenpathan2004@gmail.com",
    phone: "+91 9441246124",
  },
  stats: [
    { value: 8.62, decimals: 2, suffix: "", label: "B.Pharm CGPA" },
    { value: 2, decimals: 0, suffix: "", label: "Research projects" },
    { value: 1, decimals: 0, suffix: " month", label: "Lab training" },
  ],
  skills: [
    { name: "Pharmaceutical Analysis", potion: "Analyst's Elixir", color: "#ff8fc7", items: ["UV-Visible Spectrophotometry", "Ibuprofen Quantification", "Acid-Base Titration"] },
    { name: "Formulation", potion: "Formulator's Draught", color: "#7fe7ff", items: ["Mouthwash Formulation", "Antiseptic Ingredients", "Oral Hygiene"] },
    { name: "Laboratory Practice", potion: "Laboratory Tonic", color: "#b49bff", items: ["Basic Tablet Compression", "GMP Knowledge", "Green Solvents"] },
    { name: "Digital Tools", potion: "Digital Craft", color: "#7dffb5", items: ["App Development", "Lovable", "Generative AI"] },
    { name: "Communication", potion: "Voice & Story", color: "#ffc56b", items: ["Telugu", "English", "Hindi"] },
    { name: "Professional Skills", potion: "Practice of Care", color: "#8fb8ff", items: ["Team Projects", "Communication", "Pharmaceutical Sciences"] },
  ],
  projects: [
    {
      numeral: "I",
      title: "Herbo-Synthetic Mouthwash",
      kicker: "Formulation Project · Apr–Sep 2025",
      art: "shield" as const,
      summary:
        "Formulated a mouthwash combining antiseptic and soothing ingredients into a palatable solution designed to help reduce oral microbes. Completed as part of a four-member team.",
      tech: ["Formulation", "Oral Hygiene", "Antiseptic Ingredients", "Team of 4"],
    },
    {
      numeral: "II",
      title: "Green Solvent Ibuprofen Analysis",
      kicker: "Analytical Project · Oct 2024–Mar 2025",
      art: "heatmap" as const,
      summary:
        "Explored quantification of ibuprofen through acid-base titration using green tea as an alternative to a conventional organic solvent. Completed as part of a four-member team.",
      tech: ["Ibuprofen", "Acid-Base Titration", "Green Chemistry", "Team of 4"],
    },
  ],
  achievements: [
    { title: "B.Pharm · CGPA 8.62", detail: "Shri Vishnu College of Pharmacy · through semester 6 (2026).", icon: "crown" as const },
    { title: "Generative AI Excellence", detail: "GenAI Pioneer certification · April 2026.", icon: "trophy" as const },
  ],
  certifications: [
    { name: "Generative AI Excellence — GenAI Pioneer", issuer: "April 2026" },
    { name: "Communication Skills Training", issuer: "Radio Vishnu 90.4 CR · Vishnu Audio Visual Academy · 2024" },
  ],
  timeline: [
    {
      period: "May 2026 · 1 month",
      title: "Industrial Trainee",
      place: "Teena Bio Laboratories, Hyderabad",
      detail: "Completed one month of industrial training.",
      badge: "Lab training",
    },
    {
      period: "B.Pharm · through 2026",
      title: "Bachelor of Pharmacy",
      place: "Shri Vishnu College of Pharmacy",
      detail: "CGPA 8.62 through the sixth semester.",
      badge: "CGPA 8.62",
    },
    {
      period: "2022",
      title: "Intermediate",
      place: "Narayana Junior College",
      detail: "91.4%.",
      badge: "91.4%",
    },
    {
      period: "2020",
      title: "SSC",
      place: "St. Mary's High School",
      detail: "526 marks.",
      badge: "526 marks",
    },
  ],
};

export const chapters = [
  { id: "home", label: "Prologue" },
  { id: "about", label: "The Pharmacist" },
  { id: "skills", label: "Laboratory" },
  { id: "projects", label: "Research" },
  { id: "treasury", label: "Milestones" },
  { id: "library", label: "Training" },
  { id: "contact", label: "Post Tower" },
];
