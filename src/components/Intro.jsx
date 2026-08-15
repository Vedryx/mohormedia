import { useEffect, useState } from 'react';
import logo, { logoIsSquare } from '../assets/logo';
import './Intro.css';

const DURATION = 1900;

/** Full-screen olive curtain that lifts away on first paint. */
export default function Intro() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDone(true), DURATION);
    return () => window.clearTimeout(timer);
  }, []);

  if (done) return null;

  return (
    <div className="mm-intro" aria-hidden="true">
      <div className="mm-intro__mark">
        <img src={logo} alt="" className={logoIsSquare ? 'mm-mark--round' : 'mm-mark--free'} />
        <div className="mm-intro__tagline">Ideas that bloom</div>
      </div>
    </div>
  );
}
