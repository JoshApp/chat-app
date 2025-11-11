import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this chat application, you accept and agree to be bound by the
              terms and provisions of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Age Requirement</h2>
            <p>
              You must be at least 18 years of age to use this service. By using this service, you
              represent and warrant that you are at least 18 years old.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Share illegal content or engage in illegal activities</li>
              <li>Spam or send unsolicited messages</li>
              <li>Attempt to gain unauthorized access to the service</li>
              <li>Share personally identifiable information of others without consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Content</h2>
            <p>
              You retain ownership of any content you share. However, by posting content, you grant
              us a license to use, store, and display that content as necessary to provide the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms or
              engage in harmful behavior.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Disclaimer</h2>
            <p>
              This service is provided "as is" without warranties of any kind. We are not
              responsible for user-generated content or interactions between users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service
              constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p>
              If you have questions about these terms, please contact us through the appropriate
              channels provided in the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
