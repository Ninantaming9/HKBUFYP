router.get('/searchticket', async (req, res) => {
    const { keyword } = req.query;

    try {
        const db = await connectToDB(); // 连接到数据库
        const ticketCollection = db.collection('tickets');

        const tickets = await ticketCollection.find({ $or: [{ ticketName: { $regex: keyword, $options: 'i' } }] }).toArray();
        res.status(200).json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while searching tickets' });
    }
});