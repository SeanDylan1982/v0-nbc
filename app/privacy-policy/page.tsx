import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            Northmead Bowls Club ("we", "our", "us", "the Club") respects your privacy and is committed to protecting
            your personal information in accordance with the Protection of Personal Information Act (POPIA) of South
            Africa. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
            interact with our Club, whether in person, through our website, or other means.
          </p>

          <h2>Information Officer</h2>
          <p>
            Our designated Information Officer is responsible for ensuring compliance with POPIA and addressing any
            queries related to this Privacy Policy. Contact details:
          </p>
          <p>
            Email: northmeadbowls@gmail.com
            <br />
            Phone: 011 849 7357
            <br />
            Address: Cnr 8th Avenue & 3rd Street, Northmead, Benoni
          </p>

          <h2>Information We Collect</h2>
          <p>We may collect the following personal information:</p>
          <ul>
            <li>
              <strong>Membership Information:</strong> Name, contact details, ID number, address, emergency contacts,
              bowling experience
            </li>
            <li>
              <strong>Financial Information:</strong> Payment details, membership fees, transaction history
            </li>
            <li>
              <strong>Event Participation:</strong> Registration details, results, photographs
            </li>
            <li>
              <strong>Website Usage:</strong> IP address, browser information, cookies, usage data
            </li>
            <li>
              <strong>Communications:</strong> Email correspondence, feedback, inquiries
            </li>
            <li>
              <strong>Health Information:</strong> Medical conditions relevant to participation (with explicit consent)
            </li>
          </ul>

          <h2>Purpose of Processing</h2>
          <p>We process your personal information for the following purposes:</p>
          <ul>
            <li>Managing club membership and administration</li>
            <li>Organizing and facilitating bowling events and competitions</li>
            <li>Communication about club activities, news, and events</li>
            <li>Processing payments and maintaining financial records</li>
            <li>Complying with legal and regulatory obligations</li>
            <li>Maintaining the security and management of our facilities</li>
            <li>Improving our services and website functionality</li>
            <li>Marketing and promoting club activities (with consent)</li>
          </ul>

          <h2>Legal Basis for Processing</h2>
          <p>We process your personal information based on the following legal grounds:</p>
          <ul>
            <li>
              <strong>Contract:</strong> Processing necessary for the performance of our membership agreement
            </li>
            <li>
              <strong>Consent:</strong> Where you have given clear consent for specific purposes
            </li>
            <li>
              <strong>Legitimate Interests:</strong> Where processing is necessary for our legitimate interests, such as
              ensuring the proper functioning of the Club
            </li>
            <li>
              <strong>Legal Obligation:</strong> Where processing is necessary to comply with legal requirements
            </li>
          </ul>

          <h2>Data Sharing and Disclosure</h2>
          <p>We may share your personal information with:</p>
          <ul>
            <li>Bowling governing bodies for registration and competition purposes</li>
            <li>Service providers who assist in our operations (e.g., payment processors, IT services)</li>
            <li>Legal and regulatory authorities when required by law</li>
            <li>Emergency services in case of medical emergencies</li>
          </ul>
          <p>
            We require all third parties to respect the security of your personal information and to treat it in
            accordance with the law. We do not allow our third-party service providers to use your personal data for
            their own purposes.
          </p>

          <h2>Data Security</h2>
          <p>
            We have implemented appropriate security measures to prevent your personal information from being
            accidentally lost, used, or accessed in an unauthorized way. These measures include:
          </p>
          <ul>
            <li>Secure storage of physical documents</li>
            <li>Password protection and encryption for digital information</li>
            <li>Access controls limiting who can access your information</li>
            <li>Regular security assessments and updates</li>
            <li>Staff training on data protection</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            We will only retain your personal information for as long as necessary to fulfill the purposes we collected
            it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </p>
          <p>
            Membership information is typically retained for the duration of your membership plus 5 years after
            termination. Financial records are kept for 7 years as required by tax laws.
          </p>

          <h2>Your Rights Under POPIA</h2>
          <p>Under POPIA, you have the right to:</p>
          <ul>
            <li>Request access to your personal information</li>
            <li>Request correction of inaccurate personal information</li>
            <li>Request deletion of your personal information (subject to legal requirements)</li>
            <li>Object to processing of your personal information</li>
            <li>Lodge a complaint with the Information Regulator</li>
            <li>Withdraw consent previously given</li>
          </ul>

          <h2>Cookies and Website Usage</h2>
          <p>
            Our website uses cookies and similar technologies to enhance user experience and collect usage information.
            You can control cookies through your browser settings.
          </p>

          <h2>Photography and Media</h2>
          <p>
            Photographs and videos may be taken at club events for promotional purposes. By participating in club
            events, you consent to being photographed and recorded. If you wish not to be included, please notify the
            event organizer or our Information Officer.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            We may collect personal information from children under 18 with the consent of a parent or guardian.
            Parents/guardians have the right to review and request deletion of their child's information.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The updated version will be indicated by an updated
            "Last Updated" date and will be effective immediately upon posting.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact our Information
            Officer:
          </p>
          <p>
            Email: northmeadbowls@gmail.com
            <br />
            Phone: 011 849 7357
            <br />
            Address: Cnr 8th Avenue & 3rd Street, Northmead, Benoni
          </p>

          <p className="text-sm mt-8">Last Updated: June 2, 2025</p>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
