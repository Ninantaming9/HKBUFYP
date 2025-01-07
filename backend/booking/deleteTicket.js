router.delete('/deleteticket/:id', async (req, res) => {
    const ticketId = req.params.id;

    try {
        const db = await connectToDB(); // 连接到数据库
        const ticketCollection = db.collection('tickets');

        const result = await ticketCollection.deleteOne({ _id: ObjectId(ticketId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting ticket' });
    }
});