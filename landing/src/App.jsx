import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import OutputShowcase from './components/OutputShowcase'
import BeforeAfter from './components/BeforeAfter'
import Scenarios from './components/Scenarios'
import Footer from './components/Footer'
import AppRoot from './app/AppRoot.jsx'

function LandingLayout() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <OutputShowcase />
        <BeforeAfter />
        <Scenarios />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<AppRoot />} />
        <Route path="/*" element={<LandingLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
