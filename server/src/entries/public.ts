router.get('/public', async (req, res) => {
  const entries = await prisma.entry.findMany({
    where: {
      isPublic: true,
      isDeleted: false,
    },
    include: entryInclude,
    orderBy: { dateCreated: 'desc' },
  });

  res.json({ entries });
});
