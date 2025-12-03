app.get("/api/explore", async (req, res) => {
  try {
    const notes = await prisma.entry.findMany({
      where: { isPublic: true },
      orderBy: [
        { pinned: "desc" },   // pinned notes first
        { createdAt: "desc" } // newest next
      ],
      include: entryInclude,
    });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch public notes" });
  }
});
