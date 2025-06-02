import Link from "next/link"
import { Facebook, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>011 849 7357</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:northmeadbowls@gmail.com" className="hover:underline">
                  northmeadbowls@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                <div>
                  <p>Northmead Bowls Club</p>
                  <p>Cnr 8th Avenue & 3rd Street</p>
                  <p>Northmead, Benoni</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#events" className="hover:underline">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link href="/#competitions" className="hover:underline">
                  Competitions
                </Link>
              </li>
              <li>
                <Link href="/#members" className="hover:underline">
                  Membership
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/northmeadbowlsclub"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Northmead Bowls Club. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
