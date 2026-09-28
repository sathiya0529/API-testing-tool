const UPDATED = 'September 25, 2026';

export const PRIVACY = {
  title: 'Privacy Policy', file: 'API-Tester-Privacy-Policy.txt', updated: UPDATED,
  intro: 'This policy explains what API Tester collects, why, and the choices you have. It applies to the API Tester web application.',
  sections: [
    ['Information we collect', 'Account details you provide (name, email address, optional profile picture); the content you create in the app (collections, requests, headers, bodies, environments, test cases and history); and basic technical data such as browser type and IP address recorded in server logs.'],
    ['How we use information', 'To run the service, authenticate you, execute the requests you send, show your history and analytics, deliver notifications, and keep the service secure and reliable.'],
    ['Data you send through the tool', 'Requests you send may include URLs, headers, tokens and bodies. These can be stored in your history and collections so you can reuse them. Avoid entering credentials you are not comfortable storing, and prefer environment variables for tokens.'],
    ['Authentication and security', 'Sign-in uses email and password or Google, followed by a one-time code sent to your email. Data is transmitted over encrypted connections in production deployments. No system is perfectly secure, so we cannot guarantee absolute security.'],
    ['Cookies and local storage', 'We use browser storage to keep you signed in, remember your theme and interface preferences, and improve responsiveness. We do not use it for advertising.'],
    ['Sharing', 'We do not sell your personal information. We share data only with service providers needed to operate the application (such as email delivery), when required by law, or with your consent.'],
    ['Retention and deletion', 'We keep your data while your account is active. You can delete individual requests, collections, environments and history entries at any time, and you can ask for your account to be deleted.'],
    ['Your rights', 'Depending on where you live, you may have the right to access, correct, export or delete your personal information. Contact the project maintainers to make a request.'],
    ['Children', 'API Tester is intended for developers and is not directed to children under 13.'],
    ['Changes to this policy', 'We may update this policy from time to time. The date at the top shows when it last changed.'],
    ['Contact', 'Questions about this policy can be raised with the project maintainers through the project repository linked in the footer.'],
  ],
};

export const TERMS = {
  title: 'Terms & Conditions', file: 'API-Tester-Terms-and-Conditions.txt', updated: UPDATED,
  intro: 'By creating an account or using API Tester you agree to these terms. If you do not agree, please do not use the service.',
  sections: [
    ['The service', 'API Tester lets you build, send and test HTTP requests, organise them, and review results. Features may change as the product evolves.'],
    ['Your account', 'You are responsible for the accuracy of your registration details, for keeping your credentials and verification codes private, and for activity under your account.'],
    ['Acceptable use', 'Only send requests to systems you own or have permission to test. Do not use API Tester to attack, overload or scan third-party systems, to distribute malware, or to break the law.'],
    ['Your content', 'You keep ownership of the collections, requests and test cases you create. You give us permission to store and process them as needed to provide the service.'],
    ['Third-party APIs', 'Responses come from services we do not control. We are not responsible for their content, availability or behaviour, or for costs and side effects caused by requests you send to them.'],
    ['Availability', 'We aim to keep the service available but do not promise uninterrupted access. We may perform maintenance or make changes without notice.'],
    ['Intellectual property', 'The application, its design and its code are owned by their respective authors and licensed as stated in the project repository.'],
    ['Disclaimer', 'The service is provided "as is" and "as available", without warranties of any kind, to the extent permitted by law.'],
    ['Limitation of liability', 'To the extent permitted by law, the maintainers are not liable for indirect or consequential losses, or loss of data, arising from use of the service.'],
    ['Suspension and termination', 'We may suspend or end access if these terms are broken or the service is misused. You may stop using the service and request account deletion at any time.'],
    ['Changes to these terms', 'We may update these terms. Continued use after an update means you accept the new version.'],
    ['Contact', 'Questions about these terms can be raised with the project maintainers through the project repository linked in the footer.'],
  ],
};

export const legalAsText = (doc) =>
  [`${doc.title}`, `Last updated: ${doc.updated}`, '', doc.intro, '', ...doc.sections.flatMap(([h, t], i) => [`${i + 1}. ${h}`, t, ''])].join('\n');
