import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@debatica.com' },
    update: {},
    create: {
      email: 'test@debatica.com',
      name: 'Test User',
      image: 'https://avatars.githubusercontent.com/u/1234567?v=4',
    },
  })

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      defaultModel: 'light',
    },
  })

  // Create a test project
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Policy Debate Project',
      tags: ['policy', 'nuclear', '2024'],
    },
  })

  // Create test cases
  const case1 = await prisma.case.create({
    data: {
      projectId: project.id,
      title: 'Nuclear Energy Affirmative',
      content: {
        contentions: [
          {
            title: 'Nuclear Energy Solves Climate Change',
            description: 'Nuclear energy provides clean, reliable power without greenhouse gas emissions.',
            evidence: [
              {
                claim: 'Nuclear energy produces zero carbon emissions during operation',
                source: 'International Atomic Energy Agency, 2023',
                text: 'Nuclear power plants emit no greenhouse gases during electricity generation, making them a key solution for climate change mitigation.'
              }
            ]
          }
        ]
      },
    },
  })

  const case2 = await prisma.case.create({
    data: {
      projectId: project.id,
      title: 'Nuclear Energy Negative',
      content: {
        contentions: [
          {
            title: 'Nuclear Waste Problem',
            description: 'Nuclear energy creates dangerous waste that remains radioactive for thousands of years.',
            evidence: [
              {
                claim: 'Nuclear waste remains dangerous for 10,000+ years',
                source: 'Nuclear Regulatory Commission, 2023',
                text: 'High-level nuclear waste remains radioactive and dangerous for tens of thousands of years, requiring secure storage and monitoring.'
              }
            ]
          }
        ]
      },
    },
  })

  // Create test cards
  await prisma.card.create({
    data: {
      projectId: project.id,
      url: 'https://www.iaea.org/newscenter/news/nuclear-power-and-climate-change',
      title: 'Nuclear Power and Climate Change',
      tags: ['climate', 'nuclear', 'emissions'],
      content: 'Nuclear power plants emit no greenhouse gases during electricity generation, making them a key solution for climate change mitigation.',
    },
  })

  await prisma.card.create({
    data: {
      projectId: project.id,
      url: 'https://www.nrc.gov/waste/hlw-disposal.html',
      title: 'High-Level Waste Disposal',
      tags: ['waste', 'nuclear', 'storage'],
      content: 'High-level nuclear waste remains radioactive and dangerous for tens of thousands of years, requiring secure storage and monitoring.',
    },
  })

  // Create test conversations
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      projectId: project.id,
      feature: 'rebuttal',
      mode: 'light',
    },
  })

  // Create test messages
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: 'Generate a rebuttal for the nuclear waste argument in a policy debate round.',
    },
  })

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'assistant',
      content: 'Here\'s a strategic rebuttal to the nuclear waste argument:\n\n**Key Weighing**: Focus on the solvency mechanism and timeframe advantages.\n\n**Frontlines**:\n- Nuclear waste is manageable and contained\n- Modern reactors produce less waste\n- Waste storage technology is advancing rapidly\n\n**Turns**:\n- Even if waste is a problem, climate change is worse\n- Fossil fuels create more dangerous waste\n\n**Risk Calc**:\n- Extend the climate change impact\n- Drop minor waste concerns\n- Focus on solvency mechanism',
    },
  })

  // Create test feature notes
  await prisma.featureNote.create({
    data: {
      caseId: case1.id,
      feature: 'rebuttal',
      input: {
        userInput: 'Generate a rebuttal for the nuclear waste argument',
        extra: { judgeParadigm: 'policy-maker' }
      },
      result: {
        response: 'Strategic rebuttal focusing on solvency and timeframe advantages...'
      },
      modelUsed: 'light',
      latencyMs: 2500,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created user: ${user.email}`)
  console.log(`📁 Created project: ${project.name}`)
  console.log(`📄 Created cases: ${case1.title}, ${case2.title}`)
  console.log(`💬 Created conversation with messages`)
  console.log(`📝 Created feature notes`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 