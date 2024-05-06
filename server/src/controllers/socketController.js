const socketController = (io, socket) => {
  console.log(`New connection, socket id: {${socket.id}}`);

  socket.on("setup", (userId) => {
    socket.join(userId);
    console.log(`User joined socket, user id: {${userId}}`);
  });

  socket.on("sendNotification", (notification) => {
    if (notification?.receiver?._id) {
      socket
        .to(notification.receiver._id)
        .emit("receiveNotification", notification);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected, socket id: {${socket.id}}`);
  });
};

module.exports = socketController;
