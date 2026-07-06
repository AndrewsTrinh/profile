import { profile } from '../data/resume';

// Cosmetic 8-bit "browser chrome" strip across the top of the page.
export default function BrowserBar() {
  return (
    <div className="browserbar">
      <span className="dot dot--tan" />
      <span className="dot" />
      <span className="dot" />
      <span className="url">{profile.domain}</span>
    </div>
  );
}
