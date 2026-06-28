export type Category =
  | "academic"
  | "financial"
  | "visa_immigration"
  | "housing"
  | "health_wellbeing"
  | "other";

export type KBArticle = {
  id: string;
  title: string;
  link: string;
  category: Category;
  tags: string[];
  summary: string;
  signpostOnly?: boolean;
  escalationNotes?: string;
};

export const KB_ARTICLES: KBArticle[] = [
  {
    id: "student-visa",
    title: "Student visa and CAS — official guidance",
    link: "https://www.gov.uk/student-visa",
    category: "visa_immigration",
    tags: ["visa", "cas", "immigration", "sponsor", "extend", "refusal"],
    summary:
      "Official GOV.UK student visa guidance covers eligibility, CAS, applications, extensions, financial requirements, English language, dependants, and work limits. Immigration is regulated in the UK — only qualified advisers may advise on an individual's immigration position. Withdrawn or refused CAS, visa close to expiry, course changes, or questions about what happens to status must go to a qualified adviser or staff member. The assistant may share the official link but must not interpret rules for a student's specific situation.",
    signpostOnly: true,
    escalationNotes: "Always escalate personal immigration circumstances.",
  },
  {
    id: "hardship-fund",
    title: "University Hardship Fund",
    link: "/resources/hardship-fund",
    category: "financial",
    tags: [
      "hardship",
      "grant",
      "scholarship",
      "bursary",
      "loan",
      "rent",
      "money",
      "emergency",
      "delayed payment",
    ],
    summary:
      "Discretionary one-off grants for unexpected short-term financial difficulty: delayed maintenance loan, bursary or scholarship instalment, sudden income drop, or shortfall covering rent, food, or utilities. Most enrolled students including international students can apply online with a short explanation and basic evidence such as bank statements or a letter about delayed payment. Standard decisions take 5–10 working days; a faster emergency route exists when someone is at immediate risk of being unable to afford essentials. If rent is due within days, point to the emergency route and consider flagging for staff awareness.",
  },
  {
    id: "deposit-guide",
    title: "Tenancy deposits — getting your deposit back",
    link: "/resources/deposit-guide",
    category: "housing",
    tags: ["deposit", "landlord", "tenancy", "rent", "deduction", "dispute"],
    summary:
      "In England and Wales, deposits on assured shorthold tenancies must be protected in a government-approved scheme within 30 days. Deposits should be returned in full unless there are legitimate deductions for unpaid rent, bills, or damage beyond fair wear and tear. If disputing deductions, ask for an itemised breakdown and evidence, resolve in writing, then use the scheme's free dispute resolution service. Keep tenancy agreement, inventories, photos, and correspondence. This is general information, not legal advice — complex cases (unprotected deposit, large sums, court action) should go to the students' union or a housing adviser.",
  },
  {
    id: "library",
    title: "Academic resources — library portal",
    link: "/resources/library",
    category: "academic",
    tags: [
      "exam",
      "papers",
      "reading list",
      "module",
      "library",
      "study",
      "materials",
    ],
    summary:
      "Past exam papers, module reading lists, and core study materials are on the university library portal. Sign in with a university account to reach module pages linking reading lists, lecture materials, and past paper archives. Reading lists are organised by module code — having the module details helps. Not every module has a full past paper archive; contact the module leader or academic liaison librarian if something is missing.",
  },
  {
    id: "extenuating-circumstances",
    title: "Extenuating circumstances and assessment mitigation",
    link: "/resources/extenuating-circumstances",
    category: "academic",
    tags: [
      "extension",
      "deferral",
      "illness",
      "bereavement",
      "deadline",
      "mitigation",
      "exam",
    ],
    summary:
      "If illness, bereavement, or another serious unforeseen event affects completing an assessment or meeting a deadline, students can usually apply for extenuating circumstances. Outcomes may include short extensions, deferral to the next sitting, or circumstances considered by an exam board. Apply online before or shortly after the affected assessment with a brief statement and supporting evidence such as a medical note. Deadlines and evidence vary by department — for time-critical or distressed students, point to the process quickly and consider staff awareness.",
  },
  {
    id: "it-help",
    title: "IT and account support",
    link: "/resources/it-help",
    category: "other",
    tags: [
      "password",
      "email",
      "wifi",
      "login",
      "account",
      "vle",
      "mfa",
      "locked out",
    ],
    summary:
      "Help with university accounts and systems — sign-in, email, VLE, Wi-Fi, software, password resets — via the IT service desk. Common issues like forgotten passwords, lockouts, or MFA on a new phone can be resolved through the self-service portal or by contacting the service desk directly.",
  },
  {
    id: "disability-support",
    title: "Disability and additional learning support",
    link: "/resources/disability-support",
    category: "other",
    tags: [
      "disability",
      "dyslexia",
      "adjustments",
      "dsa",
      "accessibility",
      "inclusion",
    ],
    summary:
      "Students with a disability, long-term health condition, mental-health condition, or specific learning difficulty can get tailored support including reasonable adjustments, specialist mentoring, assistive technology, and help applying for Disabled Students' Allowance. Support usually starts with registering with the disability or inclusion service and a short needs assessment. Non-urgent routine signposting in most cases.",
  },
  {
    id: "fees",
    title: "Fees, tuition and payment plans",
    link: "/resources/fees",
    category: "financial",
    tags: ["tuition", "fees", "payment", "instalment", "late", "balance"],
    summary:
      "Questions about tuition fees, paying in instalments, or late payments are handled by the finance or fees office. Many institutions offer instalment plans; acting early is better than missing a deadline. Do not quote specific fee amounts, confirm individual balances, or promise particular arrangements — those depend on the student's record and are for the fees office to confirm.",
  },
  {
    id: "careers",
    title: "Careers, part-time work and right to work",
    link: "/resources/careers",
    category: "other",
    tags: ["career", "cv", "job", "part-time", "internship", "work"],
    summary:
      "The careers service helps with CVs, applications, interviews, internships, and part-time work via appointments, drop-ins, and an online jobs board. For international students, work hours and timing are set by visa conditions — point to careers for job-seeking help and to official student visa guidance for rules, but do not advise an individual international student on their specific work rights.",
  },
  {
    id: "wellbeing",
    title: "Wellbeing and Counselling service (non-urgent)",
    link: "/resources/wellbeing",
    category: "health_wellbeing",
    tags: [
      "stress",
      "anxiety",
      "low mood",
      "counselling",
      "wellbeing",
      "homesick",
      "sleep",
    ],
    summary:
      "Supports non-urgent mental health and wellbeing concerns: stress, low mood, anxiety, homesickness, sleep problems, academic pressure. Access via self-referral through an online form and short initial assessment — short-term counselling, groups, workshops, and self-help resources. Not an emergency service. If someone describes crisis, feeling unsafe, self-harm thoughts, or inability to keep themselves safe, direct to urgent support (Samaritans 116 123, 999 if immediate danger) and escalate to a staff member immediately.",
  },
  {
    id: "report-support",
    title: "Reporting harassment, bullying or sexual misconduct",
    link: "/resources/report-and-support",
    category: "health_wellbeing",
    tags: [
      "harassment",
      "bullying",
      "sexual misconduct",
      "report",
      "hate",
    ],
    summary:
      "Students who experienced harassment, bullying, hate, or sexual misconduct can report and get support through a dedicated report-and-support service with anonymous reporting and trained adviser options. Sensitive disclosures may indicate someone is at risk — respond with care, share the report-and-support route, and route to a person rather than handling automatically. Apply emergency rules if there is immediate danger.",
    signpostOnly: true,
    escalationNotes: "Always escalate harassment and misconduct disclosures.",
  },
  {
    id: "samaritans",
    title: "Samaritans — urgent emotional support",
    link: "tel:116123",
    category: "health_wellbeing",
    tags: ["crisis", "distress", "suicide", "emergency", "samaritans"],
    summary:
      "Samaritans offers free, confidential emotional support 24/7 at 116 123 for anyone struggling to cope or in distress. Share when someone needs to talk urgently. Does not replace escalation — crisis or risk must still reach a staff member and must never be closed with the number alone.",
  },
  {
    id: "emergency-999",
    title: "Emergency services — immediate danger",
    link: "tel:999",
    category: "health_wellbeing",
    tags: ["999", "emergency", "immediate", "danger", "life", "safety"],
    summary:
      "999 is the UK emergency number for immediate danger to life or safety — risk to life, medical emergency, or immediate threat. Share when a message suggests immediate risk. Case must be highest priority and reach a human at once.",
  },
];
