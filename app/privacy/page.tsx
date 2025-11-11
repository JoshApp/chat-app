import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p>We collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Username, gender, and age (provided during signup)</li>
              <li>Email and password (for registered accounts only)</li>
              <li>Messages and conversations</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the service</li>
              <li>Authenticate and identify users</li>
              <li>Facilitate communication between users</li>
              <li>Improve and optimize the service</li>
              <li>Ensure safety and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Storage</h2>
            <p>
              Your data is stored securely using industry-standard encryption. Guest accounts are
              anonymous and require no email. Registered accounts store email addresses securely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <p>
              We do not sell or share your personal information with third parties for marketing
              purposes. We may share data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>When required by law</li>
              <li>To protect our rights or safety</li>
              <li>With service providers who help us operate the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
              <li>Opt out of certain data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to maintain your session and improve the
              service. You can control cookie settings in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Security</h2>
            <p>
              We implement reasonable security measures to protect your data. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify users of
              significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have questions about this privacy policy or your data, please contact us
              through the appropriate channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
