router.post('/booking', async (req, res) => {
    const { ticketInfo } = req.body;

    try {
        const db = await connectToDB(); // 连接到数据库
        const ticketCollection = db.collection('tickets');

        // 创建新的票务信息
        const newTicket = {
            ...ticketInfo
        };

        const result = await ticketCollection.insertOne(newTicket);
        res.status(201).json({ message: 'Ticket booked successfully', ticketId: result.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while booking ticket' });
    }
});

module.exports = router;