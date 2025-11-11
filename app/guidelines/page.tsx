import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Community Guidelines</h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p>
              We strive to create a safe, respectful, and welcoming environment for all adult users
              to connect and communicate freely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Be Respectful</h2>
            <p>
              Treat others with kindness and respect. Harassment, hate speech, discrimination, and
              bullying are not tolerated.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respect boundaries and consent</li>
              <li>Don't insult or demean other users</li>
              <li>Respect different perspectives and backgrounds</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Stay Safe</h2>
            <p>Protect yourself and others:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Don't share personal information (full name, address, phone number)</li>
              <li>Don't share financial information</li>
              <li>Be cautious about meeting people in person</li>
              <li>Report suspicious or dangerous behavior</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Prohibited Content</h2>
            <p>The following are strictly prohibited:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Content involving minors (child sexual abuse material)</li>
              <li>Non-consensual intimate images</li>
              <li>Content promoting violence or self-harm</li>
              <li>Spam or commercial solicitation</li>
              <li>Illegal activities or content</li>
              <li>Impersonation or identity theft</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reporting and Blocking</h2>
            <p>We provide tools to keep you safe:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Block:</strong> Prevent specific users from contacting you
              </li>
              <li>
                <strong>Report:</strong> Alert moderators to violations and harmful behavior
              </li>
            </ul>
            <p className="mt-4">
              All reports are reviewed by our team. False reports may result in account action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Consequences</h2>
            <p>Violations of these guidelines may result in:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Warning</li>
              <li>Temporary suspension</li>
              <li>Permanent ban</li>
              <li>Reporting to law enforcement (for illegal activities)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Age Verification</h2>
            <p>
              All users must be 18 years or older. If you suspect a user is underage, please report
              them immediately. Misrepresenting your age is a serious violation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Privacy and Anonymity</h2>
            <p>
              While we support anonymous chat, remember that anonymity is not a license for abuse.
              Be the person you'd want to chat with.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Help Us Improve</h2>
            <p>
              These guidelines will evolve with our community. If you have suggestions or concerns,
              please reach out through the reporting system.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
