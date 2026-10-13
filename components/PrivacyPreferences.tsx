import React, { useEffect, useState } from 'react';
import { analyticsAllowed } from '../lib/analytics-choice';
import { setAnalyticsChoice } from '../lib/firebase';

export default function PrivacyPreferences() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => { setEnabled(analyticsAllowed()); }, []);
  const choose = (value: boolean) => { setEnabled(value); void setAnalyticsChoice(value); };
  return <aside className="privacy-preferences" aria-label="Privacy and analytics">
    <details><summary>Privacy &amp; analytics</summary>
      <div className="privacy-copy">
        <p>Optional Google Analytics is off until you enable it. If enabled, it receives page views and interaction events, along with browser and device information. You can turn it off here at any time; doing so also clears this site’s accessible analytics cookies.</p>
        <p>The site saves your choice in this browser. Project listings load from Google Firestore, and the model notebook loads its prints, renders and 3D models from GitHub, whether analytics is enabled or not. Hosting providers still receive ordinary page requests. Following an external link takes you to that site’s own privacy settings.</p>
        <p>Questions about your information? <a href="mailto:mehdiacho@gmail.com">Email me</a>.</p>
        <div role="group" aria-label="Analytics preference"><button onClick={() => choose(false)} aria-pressed={!enabled}>Keep analytics off</button><button onClick={() => choose(true)} aria-pressed={enabled}>Enable analytics</button></div>
        <p role="status">Analytics is {enabled ? 'enabled' : 'off'}.</p>
      </div>
    </details>
  </aside>;
}
