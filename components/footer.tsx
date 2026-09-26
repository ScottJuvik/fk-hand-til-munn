"use client"

import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        {/* Three-section layout with centered team name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left Section - Links (Horizontal) */}
          <div className="order-2 md:order-1 flex flex-col items-center">
            <h4 className="text-lg font-bold mb-4 text-center">Links</h4>
            <ul className="flex flex-row gap-4 flex-wrap justify-center">
              <li>
                <Link href="/about" className="hover:text-gray-300 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-gray-300 transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link href="/statistics" className="hover:text-gray-300 transition-colors">
                  Stats
                </Link>
              </li>
              <li>
                <Link href="/band" className="hover:text-gray-300 transition-colors">
                  Band
                </Link>
              </li>
            </ul>
          </div>

          {/* Middle Section - Team Name (Centered) */}
          <div className="order-1 md:order-2 flex flex-col items-center">
                        <img
              src="/logos/club/htm-logo.jpg"
              alt="FK Hånd til Munn Logo"
              className="h-12 w-12 rounded-full object-cover mb-5"
            />
            <span className="text-xl font-bold">FK HÅND TIL MUNN</span>
            <p className="mt-2 text-gray-400">Student football team with passion</p>

            {/* Social Media Links */}
            <div className="flex gap-4 mt-4">
              <a
                href="https://www.facebook.com/groups/823620165745826"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/fk_handtilmunn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500 transition-colors"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://youtu.be/SXlhykTDEVE?si=RLsy23qlf_gqT3Oz&t=69"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition-colors"
              >
                <Youtube className="h-6 w-6" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>

          {/* Right Section - Contact (Horizontal) */}
          <div className="order-3 flex flex-col items-center">
            <h4 className="text-lg font-bold mb-4 text-center">Contact</h4>
            <ul className="flex flex-row gap-4 flex-wrap justify-center">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                fkhandtilmunn@gmail.com
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Buran
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col items-center gap-3">
          <a
            href="https://clubtempo.no/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <span className="text-sm text-gray-400 uppercase tracking-wide">Proudly sponsored by</span>
            <img src="/logos/partners/club-tempo.jpg" alt="Club Tempo" className="h-8 w-8 rounded-lg object-cover" />
          </a>
          <p className="text-center">&copy; {new Date().getFullYear()} FK Hånd til Munn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
