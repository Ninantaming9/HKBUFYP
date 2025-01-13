router.put('/editticket/:id', async (req, res) => {
    const ticketId = req.params.id;
    const updatedInfo = req.body;

    try {
        const db = await connectToDB(); // 连接到数据库
        const ticketCollection = db.collection('tickets');

        const result = await ticketCollection.updateOne({ _id: ObjectId(ticketId) }, { $set: updatedInfo });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json({ message: 'Ticket updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating ticket' });
    }
});