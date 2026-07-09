import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '#/lib/seo/meta'
import { personJsonLd } from '#/lib/seo/jsonld'
import { JsonLd } from '#/components/shared/JsonLd'
import { Hero } from '#/features/home/components/Hero'
import { Credentials } from '#/features/home/components/Credentials'
import { AboutPreview } from '#/features/home/components/AboutPreview'
import { FeaturedProjects } from '#/features/home/components/FeaturedProjects'
import { ExperiencePreview } from '#/features/home/components/ExperiencePreview'
import { SkillsPreview } from '#/features/home/components/SkillsPreview'
import { EngineeringPhilosophy } from '#/features/home/components/EngineeringPhilosophy'
import { CurrentlyBuilding } from '#/features/home/components/CurrentlyBuilding'
import { LatestWriting } from '#/features/home/components/LatestWriting'
import { ContactCta } from '#/features/home/components/ContactCta'

export const Route = createFileRoute('/')({
  head: () => seoHead({ path: '/' }),
  component: Home,
})

function Home() {
  return (
    <>
      <JsonLd data={personJsonLd()} />
      <Hero />
      <Credentials />
      <AboutPreview />
      <FeaturedProjects />
      <ExperiencePreview />
      <SkillsPreview />
      <EngineeringPhilosophy />
      <CurrentlyBuilding />
      <LatestWriting />
      <ContactCta />
    </>
  )
}
