import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { Experience } from "../components/Experience";
import { Works } from "../components/Works";
import { Skills } from "../components/Skills";
import { PdfSection } from "../components/PdfSection";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Experience />
      <Works />
      <Skills />
      <PdfSection />
      <Contact />
      <Footer />
    </main>
  );
}