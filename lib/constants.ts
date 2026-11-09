export interface Event {
  imageUrl: string;
  title: string;
  description: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const events: Event[] = [
  {
    imageUrl: "/images/event1.png",
    title: "CES 2027",
    description:
      "Discover the latest breakthroughs in AI, robotics, consumer technology, and connected devices.",
    slug: "ces-2027",
    location: "Las Vegas, NV",
    date: "January 6-9, 2027",
    time: "9:00 AM - 6:00 PM",
  },
  {
    imageUrl: "/images/event2.png",
    title: "FOSDEM 2027",
    description:
      "A free community-driven conference where developers meet, share ideas, and collaborate on open source.",
    slug: "fosdem-2027",
    location: "Brussels, Belgium",
    date: "February 6-7, 2027",
    time: "9:00 AM - 6:00 PM",
  },
  {
    imageUrl: "/images/event3.png",
    title: "KubeCon + CloudNativeCon Europe 2027",
    description:
      "Join cloud native developers and maintainers for talks, workshops, and hands-on community sessions.",
    slug: "kubecon-cloudnativecon-europe-2027",
    location: "Amsterdam, Netherlands",
    date: "March 22-25, 2027",
    time: "8:30 AM - 5:30 PM",
  },
  {
    imageUrl: "/images/event4.png",
    title: "React Summit 2027",
    description:
      "Learn from React experts about modern frontend architecture, performance, and the future of the web.",
    slug: "react-summit-2027",
    location: "Amsterdam, Netherlands",
    date: "June 11-12, 2027",
    time: "9:00 AM - 5:00 PM",
  },
  {
    imageUrl: "/images/event5.png",
    title: "HackMIT 2027",
    description:
      "Build ambitious projects with a global community of students, mentors, designers, and engineers.",
    slug: "hackmit-2027",
    location: "Cambridge, MA",
    date: "September 18-19, 2027",
    time: "10:00 AM - 10:00 AM",
  },
  {
    imageUrl: "/images/event6.png",
    title: "AWS re:Invent 2027",
    description:
      "Explore cloud innovation through technical sessions, keynotes, workshops, and networking with builders.",
    slug: "aws-reinvent-2027",
    location: "Las Vegas, NV",
    date: "November 29 - December 3, 2027",
    time: "8:00 AM - 6:00 PM",
  },
];
