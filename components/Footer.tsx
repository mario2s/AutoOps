import { APP_VERSION } from '@/lib/version'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-4 px-6">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <p>&copy; 2025 AutoOps. All rights reserved.</p>
        <p>v{APP_VERSION}</p>
      </div>
    </footer>
  )
}
