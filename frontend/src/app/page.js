import Link from "next/link";
import { ArrowUpRight, ArrowRight, Camera, Tent, Wrench, Bike, Music, Package, Search, Handshake, Leaf } from "lucide-react";

const categories = [
  [Camera, "Cameras & tech", "For your next big idea", "Cameras"],
  [Tent, "Outdoor & camping", "A little more adventure", "Outdoor"],
  [Wrench, "Tools & DIY", "Make it happen", "Tools"],
  [Bike, "Sports & fitness", "Get out and get moving", "Sports"],
  [Music, "Party & events", "Bring people together", "Events"],
  [Package, "All the essentials", "Useful things, less clutter", ""],
];

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow"><span className="eyebrow-dot" /> GOOD THINGS ARE CLOSER THAN YOU THINK</p>
          <h1>Big plans.<br />Less <span>buying.</span></h1>
          <p className="hero-text">The things you need, from people nearby. Rent for the moment. Make room for more.</p>
          <div className="hero-actions">
            <Link href="/listings" className="primary-button">Explore rentals <ArrowUpRight size={18} /></Link>
            <Link href="/listings/new" className="text-link">List your things <ArrowRight size={17} /></Link>
          </div>
          <div className="hero-note"><Leaf size={18} /> Less stuff. More possibilities.</div>
        </div>
        <div className="hero-visual">
          <div className="visual-caption">MAKE THE MOST OF YOUR NEXT WEEKEND <ArrowUpRight size={18} /></div>
          <div className="adventure-art" aria-hidden="true"><div className="art-sun" /><div className="art-mountain mountain-back" /><div className="art-mountain mountain-front" /><div className="art-ground" /><div className="art-tent"><span /></div><div className="art-trail" /></div>
          <div className="visual-bottom"><div><span className="small-label">A LITTLE INSPIRATION</span><h2>Out of office.<br />Into the outdoors.</h2></div><Link href="/listings" aria-label="Explore rentals for your next adventure" className="round-link"><ArrowUpRight /></Link></div>
          <div className="floating-note"><Tent size={23} /><span>Borrow the gear.<br /><strong>Keep the memories.</strong></span></div>
        </div>
      </section>
      <section className="category-section">
        <div className="section-heading"><div><p className="hero-eyebrow">FIND YOUR NEXT THING</p><h2>What’s on your agenda?</h2></div><Link href="/listings" className="text-link">Browse everything <ArrowRight size={18} /></Link></div>
        <div className="category-grid">{categories.map(([Icon, title, description, query]) => <Link href={`/listings?q=${encodeURIComponent(query)}`} className="category-tile" key={title}><Icon size={27} strokeWidth={1.5} /><h3>{title}</h3><p>{description}</p><ArrowUpRight className="category-arrow" size={17} /></Link>)}</div>
      </section>
      <section className="how-section"><div className="section-heading"><div><p className="hero-eyebrow">LESS EFFORT, MORE LIFE</p><h2>Great plans start with a simple borrow.</h2></div></div><div className="steps-grid">{[[Search,"01","Find your thing","Discover items for your project, weekend, or everyday life."],[Handshake,"02","Make it yours for a while","Choose your dates and book the things you need."],[Leaf,"03","Return it. Repeat.","Enjoy it, give it back, and keep your space for what matters."]].map(([Icon,number,title,text]) => <div className="step" key={number}><div className="step-top"><Icon size={23} /><span>{number}</span></div><h3>{title}</h3><p>{text}</p></div>)}</div></section>
      <section className="owner-banner"><div><p className="hero-eyebrow">YOUR SHELF COULD USE A SIDE HUSTLE</p><h2>Someone needs what<br />you already have.</h2><p>Give your useful things a second life. List an item and start sharing.</p></div><Link href="/listings/new" className="primary-button">List your first item <ArrowUpRight size={18} /></Link></section>
    </main>
  );
}
