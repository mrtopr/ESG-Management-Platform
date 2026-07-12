import prisma from '../../config/db.js';

export async function getEsgConfig() {
  let config = await prisma.esgConfig.findFirst();
  if (!config) {
    config = await prisma.esgConfig.create({
      data: {
        autoEmissionCalc: true,
        badgeAutoAward: true,
        envWeight: 0.4,
        socialWeight: 0.3,
        govWeight: 0.3
      }
    });
  }
  return config;
}
