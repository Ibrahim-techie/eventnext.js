import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <Image src="/icons/logo.png" alt="Logo" width={24} height={24} />
          <p>Dev Events</p>
        </Link>
        <ul>
          <Link href="/" className="nav-link">
            Home{" "}
          </Link>
          <Link href="/" className="nav-link">
            Events
          </Link>
          <Link href="/" className="nav-link">
            Create Event
          </Link>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
