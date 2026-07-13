import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import OutputShowcase from './components/OutputShowcase'
import BeforeAfter from './components/BeforeAfter'
import Scenarios from './components/Scenarios'
import About from './components/About'
import Footer from './components/Footer'

const AppRoot = lazy(() => import('./app/AppRoot.jsx'))

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
        <About />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/app/*"
          element={(
            <Suspense fallback={<div style={{ padding: 32 }}>Loading ArchitectIQ…</div>}>
              <AppRoot />
            </Suspense>
          )}
        />
        <Route path="*" element={<LandingLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
